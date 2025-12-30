package com.easyfinance.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.dtos.CardDto;
import com.easyfinance.dtos.HolderDto;
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

    public List<CardDto> getAll(){
        List<Optional<Card>> optCards = cardRepository.findByUserId(UserSession.getId());
        List<CardDto> cardsDto = new ArrayList<>();
        if(optCards != null){
          for (Optional<Card> optCard : optCards) {
                Card card = optCard.get();
                if(card == null){
                    continue;
                }
                CardDto cardDto = new CardDto();
                HolderDto holderDto = new HolderDto();
                BankDto bankDto = new BankDto();
                holderDto.setName(card.getHolder().getName());
                bankDto.setName(card.getBank().getName());
                cardDto.setHolder(holderDto);
                cardDto.setBank(bankDto);
                cardDto.setNumber(card.getNumber());
                cardDto.setId(card.getId());
                cardDto.setActive(card.getActive());
                cardsDto.add(cardDto);
            } 
        }
        
        return cardsDto;
    }
}
