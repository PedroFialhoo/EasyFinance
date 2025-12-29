package com.easyfinance.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.BankDto;
import com.easyfinance.services.BankService;

@RestController
@RequestMapping("/bank")
public class BankController {
    @Autowired
    private BankService bankService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody BankDto dto) {
        boolean success = bankService.create(dto);       
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Bank not created");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Bank created");
    }
}
