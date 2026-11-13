package com.extremeweather.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Ensures the DataSource JDBC URL is properly prefixed with jdbc:postgresql://
 * even if cloud providers (like Render) supply standard postgresql:// connection strings
 * or if environment variables contain raw connection URIs.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DatabaseUrlSanitizerBeanPostProcessor implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseUrlSanitizerBeanPostProcessor.class);

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties properties) {
            String url = properties.getUrl();
            if (url != null && !url.isBlank()) {
                String trimmed = url.trim();
                if (trimmed.startsWith("postgresql://") || trimmed.startsWith("postgres://")) {
                    String host = System.getenv("DB_HOST");
                    String port = System.getenv("DB_PORT");
                    String dbName = System.getenv("DB_NAME");

                    if (host != null && !host.isBlank() && dbName != null && !dbName.isBlank()) {
                        String cleanPort = (port != null && !port.isBlank()) ? port.trim() : "5432";
                        String constructedUrl = "jdbc:postgresql://" + host.trim() + ":" + cleanPort + "/" + dbName.trim();
                        log.info("Sanitized non-JDBC DataSource URL using DB_HOST/DB_PORT/DB_NAME -> jdbc:postgresql://{}:{}/{}", host.trim(), cleanPort, dbName.trim());
                        properties.setUrl(constructedUrl);
                    } else {
                        String jdbcUrl = "jdbc:" + trimmed;
                        log.info("Sanitized non-JDBC DataSource URL by prepending 'jdbc:' prefix");
                        properties.setUrl(jdbcUrl);
                    }
                }
            } else {
                String host = System.getenv().getOrDefault("DB_HOST", "localhost");
                String port = System.getenv().getOrDefault("DB_PORT", "5432");
                String dbName = System.getenv().getOrDefault("DB_NAME", "extreme_weather_db");
                String fallbackUrl = "jdbc:postgresql://" + host + ":" + port + "/" + dbName;
                log.info("Constructed default JDBC URL from environment -> jdbc:postgresql://{}:{}/{}", host, port, dbName);
                properties.setUrl(fallbackUrl);
            }
        }
        return bean;
    }
}
