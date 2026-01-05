package com.easyfinance.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.models.Bank;
import com.easyfinance.models.Card;
import com.easyfinance.repositories.BankRepository;
import com.easyfinance.repositories.CardRepository;

@Service
public class BankService {
    @Autowired
    private BankRepository bankRepository;
    
    @Autowired
    private CardRepository cardRepository;

    public boolean create(BankDto dto){
        Bank bank = new Bank();
        bank.setName(dto.getName());

        bankRepository.save(bank);
        return true;
    }

    public Bank getById(Integer id){
        Optional<Bank> optBank = bankRepository.findById(id);
        if(optBank.isPresent()){
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

    public boolean edit(BankDto dto){
        Optional<Bank> optBank = bankRepository.findById(dto.getId());
        if(optBank.isPresent()){
            Bank bank = optBank.get();
            bank.setName(dto.getName());

            bankRepository.save(bank);
            return true;
        }
        return false;
    }

    public boolean delete(int id){
        List<Optional<Card>> optCards = cardRepository.findByBankId(id);
        if(optCards.isEmpty()){
            bankRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
