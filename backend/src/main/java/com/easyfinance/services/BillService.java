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

    public List<BillDto> getAll(){
        int userId = UserSession.getId();
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
    public Boolean create(BillDto dto){
        validateBill(dto);
        User user = getActiveUser();

        Bill bill = new Bill();
        Category category = getCategory(dto);
        Card card = getCard(dto.getCard(), dto.getTypePayment(), user);

        bill.setUser(user);
        bill.setCategory(category);
        bill.setCard(card);
        bill.setName(dto.getName());
        bill.setNumberInstallments(dto.getNumberInstallments());
                    
        bill.setTypePayment(dto.getTypePayment());
        bill.setTotalValue(dto.getTotalValue());
    
        billRepository.save(bill); 
        
        LocalDate firstDueDate = dto.getFirstDueDate();
        double value = dto.getTotalValue() / dto.getNumberInstallments();

        for (int i = 1; i <= dto.getNumberInstallments(); i++) {

            LocalDate dueDate = firstDueDate.plusMonths(i - 1);
            LocalDate paymentDate = null;
            if (dto.getNumberInstallments() == 1 && (dto.getTypePayment() == TypePayment.MONEY|| dto.getTypePayment() == TypePayment.DEBIT || dto.getTypePayment() == TypePayment.PIX)){
                paymentDate = dueDate; 
            }

            billInstallmentService.create(bill, i, value, dueDate, paymentDate);
        }
        
        return true;
    }

    public List<BillDto> getByMonth(GetBillDto dto){
        int userId = UserSession.getId();

        LocalDate start = LocalDate.of(dto.getYear(), dto.getMonth(), 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<Bill> bills = billRepository.findByFilters(userId, start, end, dto.getCategoryId());
        List<BillDto> dtos = new ArrayList<>();
        for (Bill bill : bills) {
            BillDto billDto = toDto(bill, dto.getMonth(), dto.getYear());
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
        bill.setCard(getCard(dto.getCard(), dto.getTypePayment(), bill.getUser()));
               
        bill.setName(dto.getName());        
                    
        bill.setTypePayment(dto.getTypePayment());
        bill.setTotalValue(dto.getTotalValue());           
                
        bill.setNumberInstallments(dto.getNumberInstallments());
        billRepository.save(bill); 
        
        double value = dto.getTotalValue() / dto.getNumberInstallments();
        for (BillInstallment installment : installments) {
            installment.setValue(value);
            if (dto.getNumberInstallments() == 1) {
                installment.setDueDate(dto.getFirstDueDate());
                LocalDate paymentDate = paymentDateFor(dto, installment.getInstallmentNumber());
                if (paymentDate != null) {
                    installment.setPaymentDate(paymentDate);
                } else if (installment.getPaymentDate() == null && isPaidOnCreation(dto.getTypePayment())) {
                    installment.setPaymentDate(dto.getFirstDueDate());
                }
            }
            billInstallmentRepository.save(installment);
        }
        
        return true;
    }

    @Transactional
    public Boolean delete(int id){
        Optional<Bill> optBill = billRepository.findById(id);
        if (optBill.isEmpty() || !isActiveUserBill(optBill.get())) {
            return false;
        }
        billInstallmentRepository.deleteAllByBillId(id);
        billRepository.deleteById(id);
        return true;
    }

    private User getActiveUser() {
        Integer userId = UserSession.getId();
        if (userId == null) {
            throw new IllegalArgumentException("Nenhuma conta ativa");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Conta ativa nao encontrada"));
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
    
}
