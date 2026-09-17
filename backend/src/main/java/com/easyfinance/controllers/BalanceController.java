package com.easyfinance.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.BalanceAdjustmentDto;
import com.easyfinance.dtos.BalanceAmountDto;
import com.easyfinance.dtos.BalanceDto;
import com.easyfinance.dtos.BalanceRevenueDto;
import com.easyfinance.services.BalanceService;

@RestController
@RequestMapping("/balance")
public class BalanceController {
    @Autowired
    private BalanceService balanceService;

    @GetMapping
    public ResponseEntity<BalanceDto> getBalance() {
        return ResponseEntity.ok(balanceService.getBalance());
    }

    @PostMapping("/initialize")
    public ResponseEntity<?> initialize(@RequestBody BalanceAdjustmentDto dto) {
        try {
            return ResponseEntity.ok(balanceService.initialize(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/adjust")
    public ResponseEntity<?> adjust(@RequestBody BalanceAdjustmentDto dto) {
        try {
            return ResponseEntity.ok(balanceService.adjust(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addAmount(@RequestBody BalanceAmountDto dto) {
        try {
            return ResponseEntity.ok(balanceService.addAmount(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/revenue")
    public ResponseEntity<?> updateRevenue(@RequestBody BalanceRevenueDto dto) {
        try {
            return ResponseEntity.ok(balanceService.updateRevenue(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
