package com.easyfinance.services;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.models.Bill;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.repositories.BillInstallmentRepository;

@Service
public class BillInstallmentService {
    @Autowired
    private BillInstallmentRepository billInstallmentRepository;

    public boolean create(Bill bill, int installmentNumber, double value, LocalDate dueDate, LocalDate paymentDate){
        BillInstallment billInstallment = new BillInstallment();
        billInstallment.setBill(bill);
        billInstallment.setInstallmentNumber(installmentNumber);
        billInstallment.setValue(value);
        billInstallment.setDueDate(dueDate);
        if(paymentDate != null){
           billInstallment.setPaymentDate(paymentDate); 
        }

        billInstallmentRepository.save(billInstallment);
        return true;
    }

}
