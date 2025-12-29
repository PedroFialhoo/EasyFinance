package com.easyfinance.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.CategoryDto;
import com.easyfinance.models.Category;
import com.easyfinance.repositories.CategoryRepository;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public boolean create(CategoryDto dto){
        Category category = new Category();
        category.setName(dto.getName());

        categoryRepository.save(category);
        return true;
    }
}
