CREATE DATABASE IF NOT EXISTS audit_management;
USE audit_management;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'AUDITOR') NOT NULL,
    notify_audits TINYINT(1) DEFAULT 1,
    notify_findings TINYINT(1) DEFAULT 1,
    notify_reports TINYINT(1) DEFAULT 1,
    notify_registrations TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. AUDITS TABLE
CREATE TABLE IF NOT EXISTS audits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'PENDING',
    created_by INT NOT NULL,
    assigned_to INT NULL,
    completed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- 3. FINDINGS TABLE
CREATE TABLE IF NOT EXISTS findings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audit_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    risk_level ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    ai_risk_level ENUM('LOW','MEDIUM','HIGH','CRITICAL') NULL,
    ai_confidence DECIMAL(5,2) NULL,
    ai_reason TEXT NULL,
    recommendation TEXT,
    ai_recommendation TEXT NULL,
    ai_analyzed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
);

-- 4. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    audit_id INT NOT NULL,
    summary TEXT,
    overall_risk ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    generated_date DATE,
    ai_summary TEXT NULL,
    ai_observations TEXT NULL,
    ai_root_causes TEXT NULL,
    ai_recommendations TEXT NULL,
    ai_priority_actions TEXT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_generated_at TIMESTAMP NULL,

    FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. POLICY DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS policy_documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- 7. POLICY CHUNKS TABLE
CREATE TABLE IF NOT EXISTS policy_chunks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding_id VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (document_id) REFERENCES policy_documents(id) ON DELETE CASCADE
);
