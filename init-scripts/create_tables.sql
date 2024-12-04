CREATE TABLE "user" (
    "id" SERIAL PRIMARY KEY,
    "email_id" VARCHAR(255) NOT NULL UNIQUE,
    "first_name" VARCHAR(255) NOT NULL,
    "last_name" VARCHAR(255) NOT NULL,
    "created" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);


CREATE TABLE "short_url" (
    "id" SERIAL PRIMARY KEY,
    "short_url" VARCHAR(255) NOT NULL,
    "long_url" TEXT NOT NULL,
    "total_clicks" INTEGER DEFAULT 0,
    "unique_clicks" INTEGER DEFAULT 0,
    "email_id" VARCHAR(255) NOT NULL,
    "click_by_date" JSONB DEFAULT '[]',
    "alias" VARCHAR(255) NOT NULL UNIQUE,
    "topic" VARCHAR(255),
    "created" TIMESTAMP DEFAULT NOW(),
    "updated" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "short_url_logs" (
    "id" SERIAL PRIMARY KEY,
    "short_url_alias" VARCHAR(255) NOT NULL,
    "ip" VARCHAR(255) NOT NULL,
    "os_name" VARCHAR(255) NOT NULL,
    "device_name" VARCHAR(255) NOT NULL,
    "created" TIMESTAMP DEFAULT NOW(),
    "updated" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_short_url_logs FOREIGN KEY ("short_url_alias") REFERENCES "short_url" ("alias") ON DELETE CASCADE
);

CREATE TABLE "short_url_unique_os" (
    "id" SERIAL PRIMARY KEY,
    "short_url_alias" VARCHAR(255) NOT NULL,
    "os_name" VARCHAR(255) NOT NULL,
    "uk_click" INT DEFAULT 0,
    "uk_user" INT DEFAULT 0,
    "created" TIMESTAMP DEFAULT NOW(),
    "updated" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_short_url_os FOREIGN KEY ("short_url_alias") REFERENCES "short_url" ("alias") ON DELETE CASCADE
);

CREATE TABLE "short_url_unique_device" (
    "id" SERIAL PRIMARY KEY,
    "short_url_alias" VARCHAR(255) NOT NULL,
    "device_name" VARCHAR(255) NOT NULL,
    "uk_click" INT DEFAULT 0,
    "uk_user" INT DEFAULT 0,
    "created" TIMESTAMP DEFAULT NOW(),
    "updated" TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_short_url_device FOREIGN KEY ("short_url_alias") REFERENCES "short_url" ("alias") ON DELETE CASCADE
);


CREATE OR REPLACE FUNCTION update_short_url_clicks()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE short_url
    SET total_clicks = total_clicks + 1
    WHERE alias = NEW.short_url_alias;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_update_short_url_clicks
AFTER INSERT ON short_url_logs
FOR EACH ROW
EXECUTE FUNCTION update_short_url_clicks();



CREATE OR REPLACE FUNCTION update_short_url_unique_os()
RETURNS TRIGGER AS $$
DECLARE
    ip_count INT;
BEGIN
    -- Check if the combination of IP and alias exists in logs exactly once
    SELECT COUNT(*) INTO ip_count
    FROM short_url_logs
    WHERE ip = NEW.ip AND short_url_alias = NEW.short_url_alias;

    -- Check if the alias and OS combination already exists
    IF EXISTS (
        SELECT 1
        FROM short_url_unique_os
        WHERE short_url_alias = NEW.short_url_alias AND os_name = NEW.os_name
    ) THEN
        -- Update existing row
        UPDATE short_url_unique_os
        SET
            uk_click = uk_click + CASE WHEN ip_count = 1 THEN 1 ELSE 0 END,
            uk_user = uk_user + CASE WHEN ip_count = 1 THEN 1 ELSE 0 END,
            updated = NOW()
        WHERE short_url_alias = NEW.short_url_alias AND os_name = NEW.os_name;
    ELSE
        -- Insert new row
        INSERT INTO short_url_unique_os (
            short_url_alias, os_name, uk_click, uk_user, created, updated
        ) VALUES (
            NEW.short_url_alias,
            NEW.os_name,
            1, -- First click
            1, 
            NOW(),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_short_url_unique_os
AFTER INSERT ON short_url_logs
FOR EACH ROW
EXECUTE FUNCTION update_short_url_unique_os();



CREATE OR REPLACE FUNCTION update_short_url_unique_device()
RETURNS TRIGGER AS $$
DECLARE
    ip_count INT;
BEGIN
    -- Check if the combination of IP and alias exists in logs exactly once
    SELECT COUNT(*) INTO ip_count
    FROM short_url_logs
    WHERE ip = NEW.ip AND short_url_alias = NEW.short_url_alias;

    -- Check if the alias and device combination already exists
    IF EXISTS (
        SELECT 1
        FROM short_url_unique_device
        WHERE short_url_alias = NEW.short_url_alias AND device_name = NEW.device_name
    ) THEN
        -- Update existing row
        UPDATE short_url_unique_device
        SET
            uk_click = uk_click + CASE WHEN ip_count = 1 THEN 1 ELSE 0 END,
            uk_user = uk_user + CASE WHEN ip_count = 1 THEN 1 ELSE 0 END,
            updated = NOW()
        WHERE short_url_alias = NEW.short_url_alias AND device_name = NEW.device_name;
    ELSE
        -- Insert new row
        INSERT INTO short_url_unique_device (
            short_url_alias, device_name, uk_click, uk_user, created, updated
        ) VALUES (
            NEW.short_url_alias,
            NEW.device_name,
            1, -- First click
            1, 
            NOW(),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_short_url_unique_device
AFTER INSERT ON short_url_logs
FOR EACH ROW
EXECUTE FUNCTION update_short_url_unique_device();

