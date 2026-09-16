package com.easyfinance.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BillAttachmentDto {
    private int id;
    private String originalFilename;
    private long size;
    private String createdAt;
}
