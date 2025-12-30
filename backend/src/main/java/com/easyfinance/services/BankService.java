package com.easyfinance.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.models.Bank;
import com.easyfinance.repositories.BankRepository;

@Service
public class BankService {
    @Autowired
    private BankRepository bankRepository;

    public boolean create(BankDto dto){
        Bank bank = new Bank();
        bank.setName(dto.getName());

        bankRepository.save(bank);
        return true;
    }

    public Bank getById(Integer id){
        Optional<Bank> optBank = bankRepository.findById(id);
        if(optBank != null){
            Bank bank = optBank.get();
            return bank;
        }
        return null;
    }

    public List<BankDto> getAll(){
        List<Bank> banks = bankRepository.findAll();
        List<BankDto> dtos = new ArrayList<>();
        for (Bank bank : banks) {
            BankDto dto = new BankDto();
            dto.setId(bank.getId());
            dto.setName(bank.getName());
            dtos.add(dto);
        }
        return dtos;
    }
}
