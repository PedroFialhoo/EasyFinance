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
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;




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

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        CardDto card = cardService.getById(id);
        return ResponseEntity.status(HttpStatus.OK).body(card);
    }

    @PutMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody CardDto dto) {
        boolean success = cardService.edit(dto);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Card not edited");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Card edited");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        boolean success = cardService.delete(id);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Card not deleted");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Card deleted");
    }

    @GetMapping("/getAllActive")
    public ResponseEntity<?> getAllActive() {
        List<CardDto> cards = cardService.getAllActive();
        return ResponseEntity.status(HttpStatus.OK).body(cards);
    }
    
    @PostMapping("/payCard")
    public ResponseEntity<?> payCard(@RequestBody CardDto dto) {
        boolean success = cardService.payCard(dto);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Card not payed");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Card payed");
    }
}
