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

    public Boolean create(BillDto dto){
        Bill bill = new Bill();
        Category category = new Category();
        User user = new User();

        user.setId(UserSession.getId());
        category.setId(dto.getCategory().getId());

        if(dto.getCard().getId() != null){            
            Card card = new Card();
            card.setId(dto.getCard().getId());        
            bill.setCard(card);
        }        
        
        bill.setUser(user);
        bill.setCategory(category);        
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
        Optional<BillInstallment> optBillInstallment = billInstallmentRepository.findById(billInstallmentDto.getId());
        if(optBillInstallment.isEmpty()){
            return false;
        }
        BillInstallment billInstallment = optBillInstallment.get();
        billInstallment.setPaymentDate(LocalDate.now());
        billInstallmentRepository.save(billInstallment);
        Bill bill = billInstallment.getBill();
        if(bill.getTypePayment() == TypePayment.PENDING){
            if(billInstallmentDto.getTypePayment() != null && billInstallmentDto.getTypePayment() != TypePayment.PENDING){
                bill.setTypePayment(billInstallmentDto.getTypePayment());
                if(billInstallmentDto.getTypePayment() == TypePayment.CREDIT || billInstallmentDto.getTypePayment() == TypePayment.DEBIT){
                    if(billInstallmentDto.getCardDto() != null && billInstallmentDto.getCardDto().getId() != null ){
                        Optional<Card> optCard = cardRepository.findById(billInstallmentDto.getCardDto().getId());
                        if(optCard.isPresent()){
                            Card card = optCard.get();
                            bill.setCard(card);
                        }
                    }
                }
                billRepository.save(bill);
            }
            else{
                bill.setTypePayment(TypePayment.MONEY);
                billRepository.save(bill);
            }
        }
        return true;
    }
}
