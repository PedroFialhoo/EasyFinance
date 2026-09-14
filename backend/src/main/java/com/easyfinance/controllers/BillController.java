package com.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.BillDto;
import com.easyfinance.dtos.BillInstallmentDto;
import com.easyfinance.dtos.GetBillDto;
import com.easyfinance.services.BillService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/bill")
public class BillController {
    @Autowired
    private BillService billService;

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<BillDto> bills = billService.getAll();
        return ResponseEntity.ok(bills);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody BillDto dto) {
        try {
            billService.create(dto);
            return ResponseEntity.ok("Bill created");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/get/byMonth")
    public ResponseEntity<?> byMonth(@RequestBody GetBillDto dto) {
        List<BillDto> bills = billService.getByMonth(dto);
        return ResponseEntity.ok(bills);
    }
    
    @PostMapping("/payBill")
    public ResponseEntity<?> payBill(@RequestBody BillInstallmentDto dto) {
        try {
            boolean success = billService.payBill(dto);
            if(!success){
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Bill not paid");
            }
            return ResponseEntity.ok("Bill paid");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PutMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody BillDto dto) {
        try {
            boolean success = billService.edit(dto);
            if(!success) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bill not found");
            }
            return ResponseEntity.ok("Bill edited");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        boolean success = billService.delete(id);
        if(!success) {
           return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Bill not found");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Bill deleted");
    }

}
