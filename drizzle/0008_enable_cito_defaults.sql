UPDATE `price_items`
SET `cito_available` = 1,
    `cito_surcharge` = CASE
      WHEN `cito_surcharge` > 0 THEN `cito_surcharge`
      ELSE 100
    END,
    `updated_at` = CURRENT_TIMESTAMP
WHERE `category` IN ('biochemistry', 'hormones');
