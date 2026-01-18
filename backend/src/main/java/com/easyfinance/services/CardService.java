package com.easyfinance.services;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.dtos.CardDto;
import com.easyfinance.dtos.HolderDto;
import com.easyfinance.models.Bank;
import com.easyfinance.models.Bill;
import com.easyfinance.models.BillInstallment;
import com.easyfinance.models.Card;
import com.easyfinance.models.Holder;
import com.easyfinance.models.User;
import com.easyfinance.models.UserSession;
import com.easyfinance.repositories.BankRepository;
import com.easyfinance.repositories.BillInstallmentRepository;
import com.easyfinance.repositories.BillRepository;
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

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private BillInstallmentRepository billInstallmentRepository;

    public boolean create(CardDto dto){
        Card card = new Card();

        Optional<Bank> optBank = bankRepository.findById(dto.getBank().getId());
        Optional<Holder> optHolder = holderRepository.findById(dto.getHolder().getId());
        if(optBank.isEmpty() || optHolder.isEmpty() ){
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
        if(!optCards.isEmpty()){
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

    public CardDto getById(int id){
        Optional<Card> optCard = cardRepository.findById(id);
        if(optCard.isPresent()){
            Card card = optCard.get();
            CardDto cardDto = new CardDto();
            HolderDto holderDto = new HolderDto();
            BankDto bankDto = new BankDto();
            holderDto.setName(card.getHolder().getName());
            holderDto.setId(card.getHolder().getId());
            bankDto.setName(card.getBank().getName());
            bankDto.setId(card.getBank().getId());
            cardDto.setHolder(holderDto);
            cardDto.setBank(bankDto);
            cardDto.setNumber(card.getNumber());
            cardDto.setId(card.getId());
            cardDto.setActive(card.getActive());
            return cardDto;
        } 
        
        return null;
    }

    public boolean edit(CardDto dto){
        Optional<Card> optCard = cardRepository.findById(dto.getId());
        if(optCard.isEmpty()){
            return false;
        }
        Card card = optCard.get();

        Optional<Bank> optBank = bankRepository.findById(dto.getBank().getId());
        Optional<Holder> optHolder = holderRepository.findById(dto.getHolder().getId());
        if(optBank.isEmpty() || optHolder.isEmpty()){
            return false;
        }

        card.setBank(optBank.get());
        card.setHolder(optHolder.get());
                
        card.setNumber(dto.getNumber());
        card.setActive(dto.getActive());

        cardRepository.save(card);

        return true;
    }

    public boolean delete(int id){
        Optional<Card> optCard = cardRepository.findById(id);
        if(optCard.isEmpty()){
            return false;
        }

        Optional<List<Bill>> optBills = billRepository.findByCardId(id);
        if(optBills.isPresent() && !optBills.get().isEmpty()){
            return false; 
        }

        cardRepository.delete(optCard.get());
        return true;
    }

    public List<CardDto> getAllActive(){
        List<Optional<Card>> optCards = cardRepository.findByUserId(UserSession.getId());
        List<CardDto> cardsDto = new ArrayList<>();
        if(!optCards.isEmpty()){
          for (Optional<Card> optCard : optCards) {
                Card card = optCard.get();
                if(card == null){
                    continue;
                }
                if(!card.getActive()){
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

    public boolean payCard(CardDto cardDto){
        Optional<Card> optCard = cardRepository.findById(cardDto.getId());
        if(optCard.isEmpty()){
            return false;
        }
        Card card = optCard.get();
        Optional<List<Bill>> optBills = billRepository.findByCardId(card.getId());
        if (optBills.isEmpty() || optBills.get().isEmpty()) {
            return false;
        }
        List<Bill> bills = optBills.get();
        YearMonth currentMonth = YearMonth.now();
        boolean paidSomething = false;
        for (Bill bill : bills) {
            List<BillInstallment> billInstallments = billInstallmentRepository.findByBillId(bill.getId());
            for (BillInstallment installment : billInstallments) {
                YearMonth installmentMonth = YearMonth.from(installment.getDueDate());
                if (installmentMonth.equals(currentMonth) && installment.getPaymentDate() == null){
                    installment.setPaymentDate(LocalDate.now());
                    billInstallmentRepository.save(installment);
                    paidSomething = true;
                }
            }
        }

        return paidSomething;
    }
}
