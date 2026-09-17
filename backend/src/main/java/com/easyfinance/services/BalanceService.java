package com.easyfinance.services;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BalanceAdjustmentDto;
import com.easyfinance.dtos.BalanceAmountDto;
import com.easyfinance.dtos.BalanceDto;
import com.easyfinance.dtos.BalanceEntryDto;
import com.easyfinance.dtos.BalanceRevenueDto;
import com.easyfinance.models.BalanceAccount;
import com.easyfinance.models.BalanceEntry;
import com.easyfinance.models.BalanceEntryType;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BalanceAccountRepository;
import com.easyfinance.repositories.BalanceEntryRepository;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BalanceService {
    @Autowired
    private BalanceAccountRepository balanceAccountRepository;

    @Autowired
    private BalanceEntryRepository balanceEntryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BillInstallmentRepository billInstallmentRepository;

    @Transactional
    public BalanceDto getBalance() {
        User user = getActiveUser();
        BalanceAccount account = balanceAccountRepository.findByUserId(user.getId()).orElse(null);
        if (account == null) {
            return new BalanceDto();
        }

        synchronizeMonthlyRevenue(account);
        reconcilePaidInstallments(account);
        return toDto(account, user.getId());
    }

    @Transactional
    public BalanceDto initialize(BalanceAdjustmentDto dto) {
        if (dto == null || !Double.isFinite(dto.getBalance()) || dto.getBalance() < 0) {
            throw new IllegalArgumentException("Informe um saldo inicial valido");
        }

        User user = getActiveUser();
        if (balanceAccountRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("O saldo ja foi inicializado");
        }

        BalanceAccount account = new BalanceAccount();
        account.setUser(user);
        account.setBalance(0.0);
        account.setLastRevenueMonth(YearMonth.now().toString());
        addEntry(account, BalanceEntryType.INITIAL_BALANCE, dto.getBalance(), dto.getDescription(), LocalDate.now(), "INITIAL:" + user.getId());
        return toDto(account, user.getId());
    }

    @Transactional
    public BalanceDto adjust(BalanceAdjustmentDto dto) {
        if (dto == null || !Double.isFinite(dto.getBalance()) || dto.getBalance() < 0) {
            throw new IllegalArgumentException("Informe um saldo valido");
        }

        User user = getActiveUser();
        BalanceAccount account = balanceAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Informe o saldo inicial primeiro"));
        synchronizeMonthlyRevenue(account);

        double difference = dto.getBalance() - account.getBalance();
        if (Double.compare(difference, 0.0) != 0) {
            addEntry(account, BalanceEntryType.MANUAL_ADJUSTMENT, difference, dto.getDescription(), LocalDate.now(), null);
        }
        return toDto(account, user.getId());
    }

    @Transactional
    public BalanceDto addAmount(BalanceAmountDto dto) {
        if (dto == null || !Double.isFinite(dto.getAmount()) || dto.getAmount() <= 0) {
            throw new IllegalArgumentException("Informe um valor maior que zero");
        }

        User user = getActiveUser();
        BalanceAccount account = balanceAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Informe o saldo inicial primeiro"));
        synchronizeMonthlyRevenue(account);
        addEntry(account, BalanceEntryType.MANUAL_ADJUSTMENT, dto.getAmount(), dto.getDescription(), LocalDate.now(), null);
        return toDto(account, user.getId());
    }

    @Transactional
    public BalanceDto updateRevenue(BalanceRevenueDto dto) {
        if (dto == null || !Double.isFinite(dto.getRevenue()) || dto.getRevenue() < 0) {
            throw new IllegalArgumentException("Informe uma receita maior ou igual a zero");
        }
        if (dto.getPaymentDay() < 1 || dto.getPaymentDay() > 31) {
            throw new IllegalArgumentException("Informe um dia de pagamento entre 1 e 31");
        }

        User user = getActiveUser();
        BalanceAccount account = balanceAccountRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Informe o saldo inicial primeiro"));
        boolean wasUnconfigured = account.getMonthlyRevenue() == null || account.getRevenuePaymentDay() == null;
        account.setMonthlyRevenue(dto.getRevenue());
        account.setRevenuePaymentDay(dto.getPaymentDay());
        if (wasUnconfigured && !revenueDateFor(YearMonth.now(), dto.getPaymentDay()).isBefore(LocalDate.now())) {
            account.setLastRevenueMonth(YearMonth.now().minusMonths(1).toString());
        }
        balanceAccountRepository.save(account);
        synchronizeMonthlyRevenue(account);
        return toDto(account, user.getId());
    }

    @Transactional
    public void recordPaidInstallment(BillInstallment installment) {
        if (installment == null || installment.getBill() == null || installment.getPaymentDate() == null) {
            return;
        }

        User user = installment.getBill().getUser();
        BalanceAccount account = balanceAccountRepository.findByUserId(user.getId()).orElse(null);
        if (account == null) {
            return;
        }

        synchronizeMonthlyRevenue(account);
        addPaidInstallmentEntry(account, installment);
    }

    @Transactional
    public void reversePaidInstallment(BillInstallment installment) {
        if (installment == null || installment.getBill() == null || installment.getPaymentDate() == null) {
            return;
        }

        User user = installment.getBill().getUser();
        BalanceAccount account = balanceAccountRepository.findByUserId(user.getId()).orElse(null);
        if (account == null) {
            return;
        }

        synchronizeMonthlyRevenue(account);
        String paymentReference = paymentReferenceFor(installment);
        String reversalReference = "BILL_PAYMENT_REVERSAL:" + paymentReference.substring("BILL_INSTALLMENT:".length());
        if (balanceEntryRepository.existsByReferenceKey(reversalReference)) {
            return;
        }

        balanceEntryRepository.findByReferenceKey(paymentReference).ifPresent(payment ->
                addEntry(account, BalanceEntryType.BILL_PAYMENT_REVERSAL, -payment.getAmount(),
                        "Estorno: " + installment.getBill().getName(), LocalDate.now(), reversalReference));
    }

    private void synchronizeMonthlyRevenue(BalanceAccount account) {
        if (account.getMonthlyRevenue() == null || account.getRevenuePaymentDay() == null) {
            return;
        }
        YearMonth currentMonth = YearMonth.now();
        YearMonth lastMonth = YearMonth.parse(account.getLastRevenueMonth());
        while (lastMonth.isBefore(currentMonth)) {
            YearMonth nextMonth = lastMonth.plusMonths(1);
            LocalDate paymentDate = revenueDateFor(nextMonth, account.getRevenuePaymentDay());
            if (paymentDate.isAfter(LocalDate.now())) {
                break;
            }
            String referenceKey = "MONTHLY_REVENUE:" + account.getUser().getId() + ":" + nextMonth;
            if (!balanceEntryRepository.existsByReferenceKey(referenceKey)) {
                addEntry(account, BalanceEntryType.MONTHLY_REVENUE, account.getMonthlyRevenue(), "Receita mensal", paymentDate, referenceKey);
            }
            lastMonth = nextMonth;
        }
        account.setLastRevenueMonth(lastMonth.toString());
        balanceAccountRepository.save(account);
    }

    static LocalDate revenueDateFor(YearMonth month, int paymentDay) {
        return month.atDay(Math.min(paymentDay, month.lengthOfMonth()));
    }

    private void reconcilePaidInstallments(BalanceAccount account) {
        for (BillInstallment installment : billInstallmentRepository.findPaidByUser(account.getUser().getId())) {
            addPaidInstallmentEntry(account, installment);
        }
    }

    private void addPaidInstallmentEntry(BalanceAccount account, BillInstallment installment) {
        String referenceKey = paymentReferenceFor(installment);
        if (!balanceEntryRepository.existsByReferenceKey(referenceKey)) {
            addEntry(account, BalanceEntryType.BILL_PAYMENT, -installment.getValue(),
                    "Pagamento: " + installment.getBill().getName(), installment.getPaymentDate(), referenceKey);
        }
    }

    private String paymentReferenceFor(BillInstallment installment) {
        if (installment.getBalanceReference() != null && !installment.getBalanceReference().isBlank()) {
            return "BILL_INSTALLMENT:" + installment.getBalanceReference();
        }

        String legacyReference = "BILL_INSTALLMENT:" + installment.getId();
        String legacyReversalReference = "BILL_PAYMENT_REVERSAL:" + installment.getId();
        if (balanceEntryRepository.existsByReferenceKey(legacyReference)
                && !balanceEntryRepository.existsByReferenceKey(legacyReversalReference)) {
            return legacyReference;
        }

        installment.setBalanceReference(java.util.UUID.randomUUID().toString());
        billInstallmentRepository.save(installment);
        return "BILL_INSTALLMENT:" + installment.getBalanceReference();
    }

    private void addEntry(BalanceAccount account, BalanceEntryType type, double amount, String description, LocalDate entryDate, String referenceKey) {
        account.setBalance(account.getBalance() + amount);
        balanceAccountRepository.save(account);

        BalanceEntry entry = new BalanceEntry();
        entry.setUser(account.getUser());
        entry.setType(type);
        entry.setAmount(amount);
        entry.setBalanceAfter(account.getBalance());
        entry.setDescription(description == null || description.isBlank() ? defaultDescription(type) : description.trim());
        entry.setEntryDate(entryDate);
        entry.setReferenceKey(referenceKey);
        balanceEntryRepository.save(entry);
    }

    private BalanceDto toDto(BalanceAccount account, int userId) {
        BalanceDto dto = new BalanceDto();
        dto.setInitialized(true);
        dto.setBalance(account.getBalance());
        dto.setLastRevenueMonth(account.getLastRevenueMonth());
        dto.setMonthlyRevenue(account.getMonthlyRevenue());
        dto.setRevenuePaymentDay(account.getRevenuePaymentDay());
        List<BalanceEntryDto> entries = balanceEntryRepository.findByUserIdOrderByEntryDateDescIdDesc(userId).stream()
                .map(this::toEntryDto)
                .toList();
        dto.setEntries(entries);
        return dto;
    }

    private BalanceEntryDto toEntryDto(BalanceEntry entry) {
        BalanceEntryDto dto = new BalanceEntryDto();
        dto.setId(entry.getId());
        dto.setType(entry.getType());
        dto.setAmount(entry.getAmount());
        dto.setBalanceAfter(entry.getBalanceAfter());
        dto.setDescription(entry.getDescription());
        dto.setEntryDate(entry.getEntryDate());
        return dto;
    }

    private String defaultDescription(BalanceEntryType type) {
        return switch (type) {
            case INITIAL_BALANCE -> "Saldo inicial";
            case MONTHLY_REVENUE -> "Receita mensal";
            case BILL_PAYMENT -> "Pagamento de conta";
            case BILL_PAYMENT_REVERSAL -> "Estorno de pagamento";
            case MANUAL_ADJUSTMENT -> "Ajuste manual";
        };
    }

    private User getActiveUser() {
        Integer userId = UserSession.getId();
        if (userId == null) {
            throw new IllegalArgumentException("Nenhuma conta ativa");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Conta ativa nao encontrada"));
    }
}
