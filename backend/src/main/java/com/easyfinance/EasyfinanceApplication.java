package com.easyfinance;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;

import javax.sql.DataSource;

import com.zaxxer.hikari.HikariDataSource;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class EasyfinanceApplication {
    private static final Path DATA_DIRECTORY = resolveDataDirectory();
    private static final String DATA_SOURCE_URL = "jdbc:sqlite:" + DATA_DIRECTORY.resolve("easyfinance.db")
            .toAbsolutePath().toString().replace('\\', '/');

    public static void main(String[] args) {
        prepareDataDirectory();
        SpringApplication.run(EasyfinanceApplication.class, args);
    }

    @Bean
    DataSource dataSource() {
        prepareDataDirectory();
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .driverClassName("org.sqlite.JDBC")
                .url(DATA_SOURCE_URL)
                .build();
    }

    private static void prepareDataDirectory() {
        try {
            Files.createDirectories(DATA_DIRECTORY);
        } catch (IOException exception) {
            throw new IllegalStateException("Nao foi possivel criar a pasta de dados em C:\\EasyFinance\\dados", exception);
        }
    }

    private static Path resolveDataDirectory() {
        String configuredDirectory = System.getenv("EASYFINANCE_DATA_DIR");
        if (configuredDirectory != null && !configuredDirectory.isBlank()) {
            return Path.of(configuredDirectory);
        }
        if (System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win")) {
            return Path.of("C:\\EasyFinance\\dados");
        }
        return Path.of(System.getProperty("user.home"), "EasyFinance", "dados");
    }

    public static Path getDataDirectory() {
        return DATA_DIRECTORY;
    }
}
