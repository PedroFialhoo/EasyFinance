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

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<CategoryDto> category = categoryService.getAll();
        return ResponseEntity.status(HttpStatus.OK).body(category);
    }

    @PutMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody CategoryDto dto) {
        boolean success = categoryService.edit(dto);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Category not edited");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Category edited");
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        boolean success = categoryService.delete(id);
        if(!success){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Category not deleted");
        } 
        return ResponseEntity.status(HttpStatus.OK).body("Category deleted");
    }
    
}
