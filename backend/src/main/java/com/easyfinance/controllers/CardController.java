package com.easyfinance.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.CardDto;
import com.easyfinance.services.CardService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;



@RestController
@RequestMapping("/card")
public class CardController {
    @Autowired
    private CardService cardService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody CardDto dto) {
        boolean success = cardService.create(dto);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Card not created");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Card created");
    }

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<CardDto> cards = cardService.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(cards);
    }
    
    
}
