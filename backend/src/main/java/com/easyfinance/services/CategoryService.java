package com.easyfinance.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.easyfinance.dtos.CategoryDto;
import com.easyfinance.models.Bill;
import com.easyfinance.models.Category;
import com.easyfinance.repositories.BillRepository;
import com.easyfinance.repositories.CategoryRepository;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BillRepository billRepository;

    public boolean create(CategoryDto dto){
        Category category = new Category();
        category.setName(dto.getName());

        categoryRepository.save(category);
        return true;
    }

    public List<CategoryDto> getAll(){
        List<Category> categorys = categoryRepository.findAll();
        List<CategoryDto> dtos = new ArrayList<>();
        for (Category category : categorys) {
            CategoryDto dto = new CategoryDto();
            dto.setId(category.getId());
            dto.setName(category.getName());
            dtos.add(dto);
        }
        return dtos;
    }

    public boolean edit(CategoryDto dto){
        Optional<Category> optCategory = categoryRepository.findById(dto.getId());
        if(optCategory.isPresent()){
            Category category = optCategory.get();
            category.setName(dto.getName());

            categoryRepository.save(category);
            return true;
        }
        return false;
    }

    public boolean delete(int id){
        List<Bill> optBills = billRepository.findByCategoryId(id);
        if(optBills.isEmpty()){
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
