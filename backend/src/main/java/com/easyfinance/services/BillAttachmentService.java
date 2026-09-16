package com.easyfinance.services;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.easyfinance.EasyfinanceApplication;
import com.easyfinance.dtos.BillAttachmentDto;
import com.easyfinance.models.Bill;
import com.easyfinance.models.BillAttachment;
import com.easyfinance.repositories.BillAttachmentRepository;

@Service
public class BillAttachmentService {
    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;
    private static final Path ATTACHMENTS_DIRECTORY = EasyfinanceApplication.getDataDirectory()
            .resolve("anexos").toAbsolutePath().normalize();

    private final BillAttachmentRepository attachmentRepository;

    public BillAttachmentService(BillAttachmentRepository attachmentRepository) {
        this.attachmentRepository = attachmentRepository;
    }

    public List<BillAttachmentDto> list(Bill bill) {
        return attachmentRepository.findByBillIdOrderByCreatedAtDesc(bill.getId()).stream()
                .map(this::toDto)
                .toList();
    }

    public BillAttachmentDto upload(Bill bill, MultipartFile file) {
        validatePdf(file);
        String originalFilename = Path.of(file.getOriginalFilename()).getFileName().toString();
        String storedFilename = UUID.randomUUID() + ".pdf";
        Path target = ATTACHMENTS_DIRECTORY.resolve(storedFilename);
        try {
            Files.createDirectories(ATTACHMENTS_DIRECTORY);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            BillAttachment attachment = new BillAttachment();
            attachment.setBill(bill);
            attachment.setOriginalFilename(originalFilename);
            attachment.setStoredFilename(storedFilename);
            attachment.setSize(file.getSize());
            attachment.setCreatedAt(LocalDateTime.now().toString());
            return toDto(attachmentRepository.save(attachment));
        } catch (IOException | RuntimeException e) {
            try {
                Files.deleteIfExists(target);
            } catch (IOException ignored) {
                // The database record was not created, so a later cleanup can safely remove this file.
            }
            throw new IllegalStateException("Nao foi possivel salvar o anexo", e);
        }
    }

    public BillAttachment get(int billId, int attachmentId) {
        return attachmentRepository.findByIdAndBillId(attachmentId, billId)
                .orElseThrow(() -> new IllegalArgumentException("Anexo nao encontrado"));
    }

    public Path getFile(BillAttachment attachment) {
        Path file = getFilePath(attachment);
        if (!Files.isRegularFile(file)) {
            throw new IllegalArgumentException("Arquivo do anexo nao encontrado");
        }
        return file;
    }

    public void delete(BillAttachment attachment) {
        try {
            Files.deleteIfExists(getFilePath(attachment));
        } catch (IOException e) {
            throw new IllegalStateException("Nao foi possivel remover o arquivo anexado", e);
        }
        attachmentRepository.delete(attachment);
    }

    public void deleteAll(Bill bill) {
        for (BillAttachment attachment : attachmentRepository.findByBillIdOrderByCreatedAtDesc(bill.getId())) {
            delete(attachment);
        }
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Selecione um arquivo PDF");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("O PDF deve ter no maximo 20 MB");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf") || !hasPdfSignature(file)) {
            throw new IllegalArgumentException("Apenas arquivos PDF sao permitidos");
        }
    }

    private boolean hasPdfSignature(MultipartFile file) {
        byte[] signature = new byte[5];
        try (InputStream input = file.getInputStream()) {
            return input.read(signature) == signature.length
                    && signature[0] == '%'
                    && signature[1] == 'P'
                    && signature[2] == 'D'
                    && signature[3] == 'F'
                    && signature[4] == '-';
        } catch (IOException e) {
            return false;
        }
    }

    private Path getFilePath(BillAttachment attachment) {
        Path file = ATTACHMENTS_DIRECTORY.resolve(attachment.getStoredFilename()).normalize();
        if (!file.startsWith(ATTACHMENTS_DIRECTORY)) {
            throw new IllegalStateException("Caminho de anexo invalido");
        }
        return file;
    }

    private BillAttachmentDto toDto(BillAttachment attachment) {
        BillAttachmentDto dto = new BillAttachmentDto();
        dto.setId(attachment.getId());
        dto.setOriginalFilename(attachment.getOriginalFilename());
        dto.setSize(attachment.getSize());
        dto.setCreatedAt(attachment.getCreatedAt());
        return dto;
    }
}
