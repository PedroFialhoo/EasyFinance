package com.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<BankDto> banks = bankService.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(banks);
    }

    @PutMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody BankDto dto) {
        boolean success = bankService.edit(dto);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Bank not edited");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Bank edited");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        boolean success = bankService.delete(id);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Bank not deleted");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Bank deleted");
    }
}
