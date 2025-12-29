package com.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.BillDto;
import com.easyfinance.models.Bill;
import com.easyfinance.services.BillService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/bill")
public class BillController {
    @Autowired
    private BillService billService;

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<Bill> bills = billService.getAll();
        return ResponseEntity.ok(bills);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody BillDto dto) {
        boolean success = billService.create(dto);
        if(!success) {
           return ResponseEntity.status(HttpStatus.CONFLICT).body("Bill not created");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Bill created");
    }
    
    
    
    

}
