package com.easyfinance.controllers;

import java.nio.file.Path;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.easyfinance.dtos.BillDto;
import com.easyfinance.dtos.BillInstallmentDto;
import com.easyfinance.dtos.GetBillDto;
import com.easyfinance.models.Bill;
import com.easyfinance.services.BillAttachmentService;
import com.easyfinance.services.BillService;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/bill")
public class BillController {
    @Autowired
    private BillService billService;

    @Autowired
    private BillAttachmentService billAttachmentService;

    @GetMapping("/getAll")
    public ResponseEntity<?> getAll() {
        List<BillDto> bills = billService.getAll();
        return ResponseEntity.ok(bills);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestBody BillDto dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(billService.create(dto));
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

    @PostMapping("/get/byDateRange")
    public ResponseEntity<?> byDateRange(@RequestBody GetBillDto dto) {
        try {
            return ResponseEntity.ok(billService.getByDateRange(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/cancel/{id}")
    public ResponseEntity<?> cancel(@PathVariable int id) {
        if (!billService.cancelRecurringBill(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recurring bill not found");
        }
        return ResponseEntity.ok("Recurring bill cancelled");
    }

    @GetMapping("/{billId}/attachments")
    public ResponseEntity<?> listAttachments(@PathVariable int billId) {
        return billService.findActiveUserBill(billId)
                .<ResponseEntity<?>>map(bill -> ResponseEntity.ok(billAttachmentService.list(bill)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conta nao encontrada"));
    }

    @PostMapping("/{billId}/attachments")
    public ResponseEntity<?> uploadAttachment(@PathVariable int billId, @RequestParam("file") MultipartFile file) {
        return billService.findActiveUserBill(billId)
                .<ResponseEntity<?>>map(bill -> {
                    try {
                        return ResponseEntity.status(HttpStatus.CREATED).body(billAttachmentService.upload(bill, file));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest().body(e.getMessage());
                    } catch (IllegalStateException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
                    }
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conta nao encontrada"));
    }

    @GetMapping("/{billId}/attachments/{attachmentId}/content")
    public ResponseEntity<?> getAttachmentContent(@PathVariable int billId, @PathVariable int attachmentId) {
        Bill bill = billService.findActiveUserBill(billId).orElse(null);
        if (bill == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conta nao encontrada");
        }
        try {
            var attachment = billAttachmentService.get(billId, attachmentId);
            Path file = billAttachmentService.getFile(attachment);
            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline()
                            .filename(attachment.getOriginalFilename()).build().toString())
                    .body(resource);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @DeleteMapping("/{billId}/attachments/{attachmentId}")
    public ResponseEntity<?> deleteAttachment(@PathVariable int billId, @PathVariable int attachmentId) {
        if (billService.findActiveUserBill(billId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Conta nao encontrada");
        }
        try {
            billAttachmentService.delete(billAttachmentService.get(billId, attachmentId));
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

}
