package com.easyfinance.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.CategoryDto;
import com.easyfinance.services.CategoryService;

@RestController
@RequestMapping("/category")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody CategoryDto dto) {
        boolean success = categoryService.create(dto);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Category not created");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Category created");
    }
    
}
