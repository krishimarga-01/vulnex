package com.extremeweather.repository;

import com.extremeweather.entity.RiskScoringRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskScoringRuleRepository extends JpaRepository<RiskScoringRule, UUID> {

    List<RiskScoringRule> findByIsActiveTrue();

    Optional<RiskScoringRule> findByRuleVersion(String ruleVersion);

    default Optional<RiskScoringRule> findByRuleCode(String ruleCode) {
        return findByRuleVersion(ruleCode);
    }

    default List<RiskScoringRule> findByCategory(String category) {
        return findByIsActiveTrue();
    }
}
