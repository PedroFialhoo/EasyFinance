package com.easyfinance.services;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BillDto;
import com.easyfinance.models.Bill;
import com.easyfinance.models.Card;
import com.easyfinance.models.Category;
import com.easyfinance.models.TypePayment;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BillRepository;

@Service
public class BillService {
    @Autowired
    private BillRepository billRepository;
    @Autowired 
    private BillInstallmentService billInstallmentService;

    public List<Bill> getAll(){
    int userId = UserSession.getId();
    return billRepository.findByUserId(userId)
            .orElse(Collections.emptyList());
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
                    
        bill.setTypePayment(TypePayment.valueOf(dto.getTypePayment()));
        bill.setTotalValue(dto.getTotalValue());
    
        billRepository.save(bill); 
        
        LocalDate firstDueDate = dto.getFirstDueDate();
        double value = dto.getTotalValue() / dto.getNumberInstallments();

        for (int i = 1; i <= dto.getNumberInstallments(); i++) {

            LocalDate dueDate = firstDueDate.plusMonths(i - 1);
            LocalDate paymentDate = null;
            if (dto.getNumberInstallments() == 1 && (dto.getTypePayment().equals("MONEY") || dto.getTypePayment().equals("DEBIT") || dto.getTypePayment().equals("PIX"))){
                paymentDate = dueDate; 
            }

            billInstallmentService.create(bill, i, value, dueDate, paymentDate);
        }
        
        return true;
    }

}
