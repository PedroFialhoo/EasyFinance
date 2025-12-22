package com.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.models.Bill;
import com.easyfinance.services.BillService;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/bill")
public class BillController {
    @Autowired
    private BillService billService;

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<Bill> bills = billService.getAll();
        return ResponseEntity.ok("ok");
    }
    
    

}
