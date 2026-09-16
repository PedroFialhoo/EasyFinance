package com.easyfinance.services;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.dtos.BillDto;
import com.easyfinance.dtos.BillInstallmentDto;
import com.easyfinance.dtos.CardDto;
import com.easyfinance.dtos.CategoryDto;
import com.easyfinance.dtos.GetBillDto;
import com.easyfinance.dtos.HolderDto;
import com.easyfinance.dtos.UserDto;
import com.easyfinance.models.Bill;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.Card;
import com.easyfinance.models.Category;
import com.easyfinance.models.TypePayment;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.BillRepository;
import com.easyfinance.repositories.CardRepository;
import com.easyfinance.repositories.CategoryRepository;
import com.easyfinance.repositories.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class BillService {
    @Autowired
    private BalanceService balanceService;

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillInstallmentRepository billInstallmentRepository;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired 
    private BillInstallmentService billInstallmentService;

    @Autowired
    private BillAttachmentService billAttachmentService;

    public List<BillDto> getAll(){
        int userId = UserSession.getId();
        ensureRecurringOccurrencesThrough(userId, LocalDate.now().plusMonths(11));
        Optional<List<Bill>> optBills = billRepository.findByUserId(userId);
        if(optBills.isEmpty()){
            return null;
        }
        List<Bill> bills = optBills.get();
        List<BillDto> dtos = new ArrayList<>();
        for (Bill bill : bills) {
            BillDto billDto = toDto(bill, 0, 0);
            dtos.add(billDto);
        }

        return dtos;
    }

    @Transactional
    public Integer create(BillDto dto){
        validateBill(dto);
        User user = getActiveUser();

        Bill bill = new Bill();
        Category category = getCategory(dto);
        Card card = getCard(dto.getCard(), dto.getTypePayment(), user);

        bill.setUser(user);
        bill.setCategory(category);
        bill.setCard(card);
        bill.setName(dto.getName());
        bill.setFixedRecurring(dto.isFixedRecurring());
        bill.setCancelled(false);
        bill.setRecurrenceStartDate(dto.isFixedRecurring() ? dto.getFirstDueDate() : null);
        bill.setRecurrenceEndDate(dto.isFixedRecurring() ? dto.getRecurrenceEndDate() : null);
        bill.setNumberInstallments(dto.isFixedRecurring() ? 1 : dto.getNumberInstallments());
                    
        bill.setTypePayment(dto.getTypePayment());
        bill.setTotalValue(dto.getTotalValue());
    
        billRepository.save(bill); 
        
        LocalDate firstDueDate = card != null && card.getDueDay() != null
                ? dueDateFor(card.getDueDay(), dto.getFirstDueDate())
                : dto.getFirstDueDate();
        if (dto.isFixedRecurring()) {
            createRecurringOccurrences(bill, firstDueDate, recurringGenerationEnd(bill, firstDueDate));
            return bill.getId();
        }
        double value = dto.getTotalValue() / dto.getNumberInstallments();

        for (int i = 1; i <= dto.getNumberInstallments(); i++) {

            LocalDate dueDate = firstDueDate.plusMonths(i - 1);
            LocalDate paymentDate = null;
            if (dto.getNumberInstallments() == 1 && (dto.getTypePayment() == TypePayment.MONEY|| dto.getTypePayment() == TypePayment.DEBIT || dto.getTypePayment() == TypePayment.PIX)){
                paymentDate = dueDate; 
            }

            BillInstallment installment = billInstallmentService.create(bill, i, value, dueDate, paymentDate);
            if (paymentDate != null) {
                balanceService.recordPaidInstallment(installment);
            }
        }
        
        return bill.getId();
    }

    public List<BillDto> getByMonth(GetBillDto dto){
        int userId = UserSession.getId();

        LocalDate start = LocalDate.of(dto.getYear(), dto.getMonth(), 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        ensureRecurringOccurrencesThrough(userId, end);

        List<Bill> bills = billRepository.findByFilters(userId, start, end, dto.getCategoryId());
        List<BillDto> dtos = new ArrayList<>();
        for (Bill bill : bills) {
            BillDto billDto = toDto(bill, dto.getMonth(), dto.getYear());
            dtos.add(billDto);
        }

        return dtos;
    }

    public List<BillDto> getByDateRange(GetBillDto dto) {
        if (dto == null || dto.getStartDate() == null || dto.getEndDate() == null) {
            throw new IllegalArgumentException("Informe o inicio e o fim do periodo");
        }
        if (dto.getEndDate().isBefore(dto.getStartDate())) {
            throw new IllegalArgumentException("O fim do periodo deve ser posterior ao inicio");
        }
        int userId = UserSession.getId();
        ensureRecurringOccurrencesThrough(userId, dto.getEndDate());

        List<BillDto> dtos = new ArrayList<>();
        for (Bill bill : billRepository.findByFilters(userId, dto.getStartDate(), dto.getEndDate(), dto.getCategoryId())) {
            BillDto billDto = toDto(bill, 0, 0);
            billDto.setBillInstallments(billDto.getBillInstallments().stream()
                    .filter(installment -> !installment.getDueDate().isBefore(dto.getStartDate())
                            && !installment.getDueDate().isAfter(dto.getEndDate()))
                    .toList());
            dtos.add(billDto);
        }
        return dtos;
    }

    private BillDto toDto(Bill bill, int month, int year){
        BillDto billDto = new BillDto();
        billDto.setId(bill.getId());
        billDto.setName(bill.getName());
        billDto.setNumberInstallments(bill.getNumberInstallments());
        billDto.setTotalValue(bill.getTotalValue());
        billDto.setTypePayment(bill.getTypePayment());
        billDto.setFixedRecurring(bill.isFixedRecurring());
        billDto.setRecurrenceStartDate(bill.getRecurrenceStartDate());
        billDto.setRecurrenceEndDate(bill.getRecurrenceEndDate());
        billDto.setCancelled(bill.isCancelled());

        List<BillInstallment> installments = billInstallmentRepository.findByBillId(bill.getId());
        billDto.setHasPaidInstallments(installments.stream()
                .anyMatch(installment -> installment.getPaymentDate() != null));

        List<BillInstallmentDto> installmentDtos = new ArrayList<>();
        for (BillInstallment installment : installments) {

            if (month > 0 && year > 0) {
                if (installment.getDueDate().getMonthValue() != month ||
                    installment.getDueDate().getYear() != year) {
                    continue;
                }
            }

            BillInstallmentDto dto = new BillInstallmentDto();
            dto.setId(installment.getId());
            dto.setDueDate(installment.getDueDate());
            dto.setPaymentDate(installment.getPaymentDate());
            dto.setInstallmentNumber(installment.getInstallmentNumber());
            dto.setValue(installment.getValue());
            installmentDtos.add(dto);
        }

        billDto.setBillInstallments(installmentDtos);
        billDto.setAttachments(billAttachmentService.list(bill));

        if (bill.getCard() != null) {
            CardDto cardDto = new CardDto();
            cardDto.setId(bill.getCard().getId());
            cardDto.setNumber(bill.getCard().getNumber());

            HolderDto holderDto = new HolderDto();
            holderDto.setId(bill.getCard().getHolder().getId());
            holderDto.setName(bill.getCard().getHolder().getName());
            cardDto.setHolder(holderDto);

            BankDto bankDto = new BankDto();
            bankDto.setId(bill.getCard().getBank().getId());
            bankDto.setName(bill.getCard().getBank().getName());
            cardDto.setBank(bankDto);

            billDto.setCard(cardDto);
        }

        CategoryDto categoryDto = new CategoryDto();
        categoryDto.setId(bill.getCategory().getId());
        categoryDto.setName(bill.getCategory().getName());
        billDto.setCategory(categoryDto);

        UserDto userDto = new UserDto();
        userDto.setId(bill.getUser().getId());
        userDto.setUsername(bill.getUser().getUsername());
        billDto.setUser(userDto);

        return billDto;
    }    

    @Transactional
    public boolean payBill(BillInstallmentDto billInstallmentDto){
        if (billInstallmentDto == null) {
            throw new IllegalArgumentException("Parcela obrigatoria");
        }
        Optional<BillInstallment> optBillInstallment = billInstallmentRepository.findById(billInstallmentDto.getId());
        if(optBillInstallment.isEmpty()){
            return false;
        }
        BillInstallment billInstallment = optBillInstallment.get();
        Bill bill = billInstallment.getBill();
        if (!isActiveUserBill(bill) || billInstallment.getPaymentDate() != null) {
            return false;
        }

        if(bill.getTypePayment() == TypePayment.PENDING){
            TypePayment typePayment = billInstallmentDto.getTypePayment();
            if (typePayment == null || typePayment == TypePayment.PENDING) {
                throw new IllegalArgumentException("Selecione uma forma de pagamento");
            }
            bill.setTypePayment(typePayment);
            bill.setCard(getCard(billInstallmentDto.getCardDto(), typePayment, bill.getUser()));
            billRepository.save(bill);
        }

        billInstallment.setPaymentDate(LocalDate.now());
        billInstallmentRepository.save(billInstallment);
        balanceService.recordPaidInstallment(billInstallment);
        return true;
    }
    
    @Transactional
    public Boolean edit(BillDto dto){
        if (dto == null || dto.getId() == null) {
            throw new IllegalArgumentException("Conta obrigatoria");
        }
        Optional<Bill> optBill = billRepository.findById(dto.getId());
        if(optBill.isEmpty()){
            return false;
        }
        Bill bill = optBill.get();
        if (!isActiveUserBill(bill)) {
            return false;
        }
        validateBill(dto);
        if (bill.isFixedRecurring()) {
            return editRecurringBill(bill, dto);
        }
        if (dto.getNumberInstallments() != bill.getNumberInstallments()) {
            throw new IllegalArgumentException("Nao e permitido alterar a quantidade de parcelas");
        }

        List<BillInstallment> installments = billInstallmentRepository.findByBillId(bill.getId());
        if (installments.size() != bill.getNumberInstallments()) {
            throw new IllegalStateException("Parcelas da conta estao inconsistentes");
        }
        if (installments.stream().anyMatch(installment -> installment.getPaymentDate() != null)
                && Double.compare(dto.getTotalValue(), bill.getTotalValue()) != 0) {
            throw new IllegalArgumentException("Nao e permitido alterar o valor de uma conta com parcelas pagas");
        }

        bill.setCategory(getCategory(dto));
        Card card = getCard(dto.getCard(), dto.getTypePayment(), bill.getUser());
        bill.setCard(card);
               
        bill.setName(dto.getName());        
                    
        bill.setTypePayment(dto.getTypePayment());
        bill.setTotalValue(dto.getTotalValue());           
                
        bill.setNumberInstallments(dto.getNumberInstallments());
        billRepository.save(bill); 
        
        LocalDate firstDueDate = card != null && card.getDueDay() != null
                ? dueDateFor(card.getDueDay(), dto.getFirstDueDate())
                : dto.getFirstDueDate();
        double value = dto.getTotalValue() / dto.getNumberInstallments();
        for (BillInstallment installment : installments) {
            boolean wasPaid = installment.getPaymentDate() != null;
            installment.setValue(value);
            if (dto.getNumberInstallments() == 1) {
                installment.setDueDate(firstDueDate);
                LocalDate paymentDate = paymentDateFor(dto, installment.getInstallmentNumber());
                if (paymentDate != null) {
                    installment.setPaymentDate(paymentDate);
                } else if (installment.getPaymentDate() == null && isPaidOnCreation(dto.getTypePayment())) {
                    installment.setPaymentDate(firstDueDate);
                }
            }
            billInstallmentRepository.save(installment);
            if (!wasPaid && installment.getPaymentDate() != null) {
                balanceService.recordPaidInstallment(installment);
            }
        }
        
        return true;
    }

    @Transactional
    public Boolean delete(int id){
        Optional<Bill> optBill = billRepository.findById(id);
        if (optBill.isEmpty() || !isActiveUserBill(optBill.get())) {
            return false;
        }
        List<BillInstallment> installments = billInstallmentRepository.findByBillId(id);
        for (BillInstallment installment : installments) {
            if (installment.getPaymentDate() != null) {
                balanceService.reversePaidInstallment(installment);
            }
        }
        billAttachmentService.deleteAll(optBill.get());
        billInstallmentRepository.deleteAllByBillId(id);
        billRepository.deleteById(id);
        return true;
    }

    @Transactional
    public boolean cancelRecurringBill(int id) {
        Optional<Bill> optBill = billRepository.findById(id);
        if (optBill.isEmpty() || !isActiveUserBill(optBill.get()) || !optBill.get().isFixedRecurring() || optBill.get().isCancelled()) {
            return false;
        }
        Bill bill = optBill.get();
        bill.setCancelled(true);
        billRepository.save(bill);
        billInstallmentRepository.deletePendingByBillIdAfter(id, LocalDate.now());
        return true;
    }

    @Transactional
    public void ensureRecurringOccurrencesThrough(int userId, LocalDate endDate) {
        for (Bill bill : billRepository.findByUserIdAndFixedRecurringTrueAndCancelledFalse(userId)) {
            LocalDate startDate = bill.getRecurrenceStartDate();
            if (startDate == null || endDate.isBefore(startDate)) {
                continue;
            }
            LocalDate lastDate = bill.getRecurrenceEndDate() == null || bill.getRecurrenceEndDate().isAfter(endDate)
                    ? endDate
                    : dueDateForBill(bill, bill.getRecurrenceEndDate());
            createRecurringOccurrences(bill, dueDateForBill(bill, startDate), lastDate);
        }
    }

    private User getActiveUser() {
        Integer userId = UserSession.getId();
        if (userId == null) {
            throw new IllegalArgumentException("Nenhuma conta ativa");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Conta ativa nao encontrada"));
    }

    private LocalDate dueDateFor(int dueDay, LocalDate month) {
        return month.withDayOfMonth(Math.min(dueDay, month.lengthOfMonth()));
    }

    private void validateBill(BillDto dto) {
        if (dto == null || dto.getName() == null || dto.getName().isBlank()) {
            throw new IllegalArgumentException("Nome obrigatorio");
        }
        if (dto.getCategory() == null || dto.getCategory().getId() == null) {
            throw new IllegalArgumentException("Categoria obrigatoria");
        }
        if (dto.getTypePayment() == null) {
            throw new IllegalArgumentException("Forma de pagamento obrigatoria");
        }
        if (dto.getFirstDueDate() == null) {
            throw new IllegalArgumentException("Data obrigatoria");
        }
        if (!Double.isFinite(dto.getTotalValue()) || dto.getTotalValue() <= 0) {
            throw new IllegalArgumentException("Valor total deve ser maior que zero");
        }
        if (dto.getNumberInstallments() < 1) {
            throw new IllegalArgumentException("Numero de parcelas deve ser maior que zero");
        }
        if (dto.isFixedRecurring() && dto.getRecurrenceEndDate() != null
                && dto.getRecurrenceEndDate().isBefore(dto.getFirstDueDate())) {
            throw new IllegalArgumentException("O termino da recorrencia deve ser posterior ao inicio");
        }
    }

    private Category getCategory(BillDto dto) {
        return categoryRepository.findById(dto.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria nao encontrada"));
    }

    private Card getCard(CardDto cardDto, TypePayment typePayment, User user) {
        boolean requiresCard = typePayment == TypePayment.CREDIT || typePayment == TypePayment.DEBIT;
        if (!requiresCard) {
            return null;
        }
        if (cardDto == null || cardDto.getId() == null) {
            throw new IllegalArgumentException("Cartao obrigatorio para este pagamento");
        }
        Card card = cardRepository.findById(cardDto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cartao nao encontrado"));
        if (!Boolean.TRUE.equals(card.getActive()) || card.getUser().getId() != user.getId()) {
            throw new IllegalArgumentException("Cartao indisponivel");
        }
        return card;
    }

    private boolean isActiveUserBill(Bill bill) {
        Integer userId = UserSession.getId();
        return userId != null && bill.getUser().getId() == userId;
    }

    public Optional<Bill> findActiveUserBill(int id) {
        return billRepository.findById(id).filter(this::isActiveUserBill);
    }

    private LocalDate paymentDateFor(BillDto dto, int installmentNumber) {
        if (dto.getBillInstallments() == null) {
            return null;
        }
        return dto.getBillInstallments().stream()
                .filter(installment -> installment.getInstallmentNumber() == installmentNumber)
                .map(BillInstallmentDto::getPaymentDate)
                .filter(paymentDate -> paymentDate != null)
                .findFirst()
                .orElse(null);
    }

    private boolean isPaidOnCreation(TypePayment typePayment) {
        return typePayment == TypePayment.MONEY
                || typePayment == TypePayment.DEBIT
                || typePayment == TypePayment.PIX;
    }

    private Boolean editRecurringBill(Bill bill, BillDto dto) {
        if (bill.isCancelled()) {
            throw new IllegalArgumentException("Uma conta fixa cancelada nao pode ser editada");
        }
        bill.setCategory(getCategory(dto));
        bill.setCard(getCard(dto.getCard(), dto.getTypePayment(), bill.getUser()));
        bill.setName(dto.getName());
        bill.setTypePayment(dto.getTypePayment());
        bill.setTotalValue(dto.getTotalValue());
        bill.setRecurrenceEndDate(dto.getRecurrenceEndDate());
        billRepository.save(bill);

        LocalDate nextDueDate = dueDateForBill(bill, LocalDate.now().withDayOfMonth(1).plusMonths(1));
        for (BillInstallment installment : billInstallmentRepository.findByBillId(bill.getId())) {
            if (installment.getPaymentDate() == null && !installment.getDueDate().isBefore(nextDueDate)) {
                installment.setValue(dto.getTotalValue());
                billInstallmentRepository.save(installment);
            }
        }
        ensureRecurringOccurrencesThrough(bill.getUser().getId(), recurringGenerationEnd(bill, nextDueDate));
        return true;
    }

    private void createRecurringOccurrences(Bill bill, LocalDate firstDueDate, LocalDate lastDate) {
        LocalDate dueDate = firstDueDate;
        int occurrenceNumber = 1;
        while (!dueDate.isAfter(lastDate)) {
            if (!billInstallmentRepository.existsByBillIdAndDueDate(bill.getId(), dueDate)) {
                billInstallmentService.create(bill, occurrenceNumber, bill.getTotalValue(), dueDate, null);
            }
            dueDate = dueDateForBill(bill, dueDate.plusMonths(1));
            occurrenceNumber++;
        }
    }

    private LocalDate recurringGenerationEnd(Bill bill, LocalDate firstDueDate) {
        if (bill.getRecurrenceEndDate() != null) {
            return dueDateForBill(bill, bill.getRecurrenceEndDate());
        }
        return firstDueDate.plusMonths(11);
    }

    private LocalDate dueDateForBill(Bill bill, LocalDate month) {
        if (bill.getCard() != null && bill.getCard().getDueDay() != null) {
            return dueDateFor(bill.getCard().getDueDay(), month);
        }
        LocalDate startDate = bill.getRecurrenceStartDate();
        int dueDay = startDate == null ? month.getDayOfMonth() : startDate.getDayOfMonth();
        return dueDateFor(dueDay, month);
    }
    
}
