package com.easyfinance.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.HolderDto;
import com.easyfinance.models.Holder;
import com.easyfinance.repositories.HolderRepository;

@Service
public class HolderService {
    @Autowired
    private HolderRepository holderRepository;

    public boolean create(HolderDto dto){
        Holder holder = new Holder();
        holder.setName(dto.getName());

        holderRepository.save(holder);
        return true;
    }
}
