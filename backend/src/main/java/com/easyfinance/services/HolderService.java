package com.easyfinance.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.HolderDto;
import com.easyfinance.models.Card;
import com.easyfinance.models.Holder;
import com.easyfinance.repositories.CardRepository;
import com.easyfinance.repositories.HolderRepository;

@Service
public class HolderService {
    @Autowired
    private HolderRepository holderRepository;

    @Autowired
    private CardRepository cardRepository;

    public boolean create(HolderDto dto){
        Holder holder = new Holder();
        holder.setName(dto.getName());

        holderRepository.save(holder);
        return true;
    }

    public Holder getById(Integer id){
        Optional<Holder> optHolder = holderRepository.findById(id);
        if(optHolder.isPresent()){
            Holder holder = optHolder.get();
            return holder;
        }
        return null;
    }

    public List<HolderDto> getAll(){
        List<Holder> holders = holderRepository.findAll();
        List<HolderDto> dtos = new ArrayList<>();
        for (Holder holder : holders) {
            HolderDto dto = new HolderDto();
            dto.setId(holder.getId());
            dto.setName(holder.getName());
            dtos.add(dto);
        }
        return dtos;
    }

    public boolean edit(HolderDto dto){
        Optional<Holder> optHolder = holderRepository.findById(dto.getId());
        if(optHolder.isPresent()){
            Holder holder = optHolder.get();
            holder.setName(dto.getName());

            holderRepository.save(holder);
            return true;
        }
        return false;
    }

    public boolean delete(int id){
        List<Optional<Card>> optCards = cardRepository.findByHolderId(id);
        if(optCards.isEmpty()){
            holderRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
