package com.easyfinance.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.easyfinance.models.Bill;

@Service
public class BillService {
    public List<Bill> getAll(){
        List<Bill> bills = new ArrayList<>();
        return bills;
    }
}
