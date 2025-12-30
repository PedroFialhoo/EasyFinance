package com.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.HolderDto;
import com.easyfinance.services.HolderService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/holder")
public class HolderController {
    @Autowired
    private HolderService holderService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody HolderDto dto) {
        boolean success = holderService.create(dto);       
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Holder not created");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Holder created");
    }
    
    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<HolderDto> holders = holderService.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(holders);
    }
    
}
