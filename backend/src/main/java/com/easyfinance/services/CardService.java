package com.easyfinance.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.CardDto;
import com.easyfinance.models.Bank;
import com.easyfinance.models.Card;
import com.easyfinance.models.Holder;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BankRepository;
import com.easyfinance.repositories.CardRepository;
import com.easyfinance.repositories.HolderRepository;

@Service
public class CardService {
    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private HolderRepository holderRepository;

    @Autowired
    private BankRepository bankRepository;


    public boolean create(CardDto dto){
        Card card = new Card();

        Optional<Bank> optBank = bankRepository.findById(dto.getBank().getId());
        Optional<Holder> optHolder = holderRepository.findById(dto.getHolder().getId());
        if(optBank == null || optHolder == null){
            return false;
        }

        card.setBank(optBank.get());
        card.setHolder(optHolder.get());
        
        User user = new User();
        user.setId(UserSession.getId());
        
        card.setUser(user);
        card.setNumber(dto.getNumber());
        card.setActive(true);

        cardRepository.save(card);

        return true;
    }
}
