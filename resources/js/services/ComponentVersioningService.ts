/**
 * Component Versioning System for React Wrapper
 * Handles versioning, compatibility, migrations, and updates
 */

import React from 'react';
import { devTools } from './DevTools';

interface ComponentVersion {
  version: string;
  component: React.ComponentType<Record<string, unknown>>;
  metadata: ComponentMetadata;
  deprecated?: boolean;
  deprecationMessage?: string;
  migrationPath?: string;
  breakingChanges?: BreakingChange[];
  dependencies?: ComponentDependency[];
}

interface ComponentMetadata {
  name: string;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  changelog: ChangelogEntry[];
  tags: string[];
  category: string;
  apiVersion: string;
  dependencies?: ComponentDependency[];
}

interface BreakingChange {
  type: 'prop' | 'method' | 'event' | 'structure';
  description: string;
  migration: string;
  affectedProps?: string[];
  replacedWith?: string;
}

interface ComponentDependency {
  name: string;
  version: string;
  optional?: boolean;
  reason?: string;
}

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: string[];
  author: string;
}

interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  migratedProps: Record<string, unknown>;
  warnings: string[];
  errors: string[];
  manualStepsRequired: boolean;
}

interface CompatibilityCheck {
  compatible: boolean;
  issues: CompatibilityIssue[];
  recommendations: string[];
  autoMigrationAvailable: boolean;
}

interface CompatibilityIssue {
  severity: 'error' | 'warning' | 'info';
  type: string;
  description: string;
  affectedProps?: string[];
  solution?: string;
}

interface VersionConstraint {
  min?: string;
  max?: string;
  exact?: string;
  exclude?: string[];
}

class ComponentVersioningService {
  private versions: Map<string, Map<string, ComponentVersion>> = new Map();
  private aliases: Map<string, string> = new Map(); // component@alias -> component@version
  private migrations: Map<string, MigrationFunction[]> = new Map();
  private defaultVersions: Map<string, string> = new Map();
  private compatibilityRules: Map<string, CompatibilityRule[]> = new Map();

  constructor() {
    this.setupDefaultAliases();
  }

  /**
   * Register a new component version
   */
  registerVersion(
    componentName: string,
    version: string,
    component: unknown,
    metadata: Partial<ComponentMetadata> = {}
  ): void {
    if (!this.versions.has(componentName)) {
      this.versions.set(componentName, new Map());
    }

    const componentVersions = this.versions.get(componentName)!;

    const fullMetadata: ComponentMetadata = {
      name: componentName,
      description: metadata.description || '',
      author: metadata.author || 'Unknown',
      createdAt: metadata.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      changelog: metadata.changelog || [],
      tags: metadata.tags || [],
      category: metadata.category || 'general',
      apiVersion: metadata.apiVersion || '1.0.0',
    };

    const componentVersion: ComponentVersion = {
      version,
      component: component as React.ComponentType<Record<string, unknown>>,
      metadata: fullMetadata,
      deprecated: false,
      dependencies: metadata.dependencies || [],
    };

    componentVersions.set(version, componentVersion);

    // Set as default if it's the first version or marked as latest
    if (!this.defaultVersions.has(componentName) || version === 'latest') {
      this.defaultVersions.set(componentName, version);
    }

    devTools.log(`Component version registered: ${componentName}@${version}`);
  }

  /**
   * Get version string for a component
   */
  getVersion(componentName: string): string | undefined {
    return this.defaultVersions.get(componentName);
  }

  /**
   * Get a specific component version object
   */
  getComponentVersion(componentName: string, version?: string): ComponentVersion | null {
    const componentVersions = this.versions.get(componentName);
    if (!componentVersions) {
      return null;
    }

    // Resolve version
    const resolvedVersion = this.resolveVersion(componentName, version);
    if (!resolvedVersion) {
      return null;
    }

    return componentVersions.get(resolvedVersion!) || null;
  }

  /**
   * Get all versions of a component
   */
  getAllVersions(componentName: string): ComponentVersion[] {
    const componentVersions = this.versions.get(componentName);
    if (!componentVersions) {
      return [];
    }

    return Array.from(componentVersions.values()).sort((a, b) =>
      this.compareVersions(b.version, a.version)
    ); // Latest first
  }

  /**
   * Get latest version of a component
   */
  getLatestVersion(componentName: string): ComponentVersion | null {
    const versions = this.getAllVersions(componentName);
    return versions.length > 0 ? versions[0] || null : null;
  }

  /**
   * Check if component version exists
   */
  hasVersion(componentName: string, version?: string): boolean {
    return this.getComponentVersion(componentName, version) !== null;
  }

  /**
   * Register version alias
   */
  registerAlias(componentName: string, alias: string, version: string): void {
    const key = `${componentName}@${alias}`;
    this.aliases.set(key, `${componentName}@${version}`);
    devTools.log(`Version alias registered: ${key} -> ${componentName}@${version}`);
  }

  /**
   * Deprecate a component version
   */
  deprecateVersion(
    componentName: string,
    version: string,
    message?: string,
    migrationPath?: string
  ): void {
    const componentVersion = this.getComponentVersion(componentName, version);
    if (componentVersion) {
      componentVersion.deprecated = true;
      componentVersion.deprecationMessage = message;
      componentVersion.migrationPath = migrationPath;

      devTools.warn(`Component version deprecated: ${componentName}@${version}`, {
        message,
        migrationPath,
      });
    }
  }

  /**
   * Add migration function between versions
   */
  addMigration(
    componentName: string,
    fromVersion: string,
    toVersion: string,
    migrationFn: MigrationFunction
  ): void {
    const key = `${componentName}:${fromVersion}->${toVersion}`;

    if (!this.migrations.has(key)) {
      this.migrations.set(key, []);
    }

    this.migrations.get(key)!.push(migrationFn);
    devTools.log(`Migration registered: ${key}`);
  }

  /**
   * Migrate props from one version to another
   */
  async migrateProps(
    componentName: string,
    fromVersion: string,
    toVersion: string,
    props: Record<string, unknown>
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      fromVersion,
      toVersion,
      migratedProps: { ...props },
      warnings: [],
      errors: [],
      manualStepsRequired: false,
    };

    try {
      // Find migration path
      const migrationPath = this.findMigrationPath(componentName, fromVersion, toVersion);

      if (migrationPath.length === 0) {
        result.errors.push(`No migration path found from ${fromVersion} to ${toVersion}`);
        return result;
      }

      // Apply migrations step by step
      let currentProps = { ...props };

      for (const step of migrationPath) {
        const migrations = this.migrations.get(step) || [];

        for (const migration of migrations) {
          try {
            const [fromPart, toPart] = step.split('->');
            const fromVersion = fromPart?.split(':')[1];
            const toVersion = toPart;

            if (!fromVersion || !toVersion) {
              result.errors.push(`Invalid migration step format: ${step}`);
              return result;
            }

            const migrationResult = await migration(currentProps, {
              componentName,
              fromVersion,
              toVersion,
            });

            currentProps = migrationResult.props;
            result.warnings.push(...(migrationResult.warnings || []));

            if (migrationResult.manualStepsRequired) {
              result.manualStepsRequired = true;
            }
          } catch (error) {
            result.errors.push(`Migration failed at step ${step}: ${error}`);
            return result;
          }
        }
      }

      result.migratedProps = currentProps;
      result.success = result.errors.length === 0;

      return result;
    } catch (error) {
      result.errors.push(`Migration error: ${error}`);
      return result;
    }
  }

  /**
   * Check compatibility between versions
   */
  checkCompatibility(
    componentName: string,
    fromVersion: string,
    toVersion: string
  ): CompatibilityCheck {
    const result: CompatibilityCheck = {
      compatible: true,
      issues: [],
      recommendations: [],
      autoMigrationAvailable: false,
    };

    const fromVersionObj = this.getComponentVersion(componentName, fromVersion);
    const toVersionObj = this.getComponentVersion(componentName, toVersion);

    if (!fromVersionObj || !toVersionObj) {
      result.compatible = false;
      result.issues.push({
        severity: 'error',
        type: 'version_not_found',
        description: 'One or both versions not found',
      });
      return result;
    }

    // Check breaking changes
    if (
      (toVersionObj as ComponentVersion & { breakingChanges?: BreakingChange[] }).breakingChanges
    ) {
      for (const change of (
        toVersionObj as ComponentVersion & { breakingChanges: BreakingChange[] }
      ).breakingChanges) {
        result.issues.push({
          severity: 'warning',
          type: 'breaking_change',
          description: change.description,
          affectedProps: change.affectedProps,
          solution: change.migration,
        });
      }
    }

    // Check if migration is available
    const migrationPath = this.findMigrationPath(componentName, fromVersion, toVersion);
    result.autoMigrationAvailable = migrationPath.length > 0;

    if (!result.autoMigrationAvailable && result.issues.length > 0) {
      result.compatible = false;
      result.recommendations.push('Manual migration required due to breaking changes');
    }

    // Check compatibility rules
    const rules = this.compatibilityRules.get(componentName) || [];
    for (const rule of rules) {
      const ruleResult = rule(fromVersionObj as ComponentVersion, toVersionObj as ComponentVersion);
      if (ruleResult) {
        result.issues.push(...ruleResult.issues);
        result.recommendations.push(...ruleResult.recommendations);

        if (ruleResult.issues.some(issue => issue.severity === 'error')) {
          result.compatible = false;
        }
      }
    }

    return result;
  }

  /**
   * Get version constraints satisfaction
   */
  satisfiesConstraint(version: string, constraint: VersionConstraint): boolean {
    if (constraint.exact) {
      return version === constraint.exact;
    }

    if (constraint.exclude && constraint.exclude.includes(version)) {
      return false;
    }

    if (constraint.min && this.compareVersions(version, constraint.min) < 0) {
      return false;
    }

    if (constraint.max && this.compareVersions(version, constraint.max) > 0) {
      return false;
    }

    return true;
  }

  /**
   * Find best matching version for constraint
   */
  findBestVersion(componentName: string, constraint: VersionConstraint): string | null {
    const versions = this.getAllVersions(componentName);

    for (const versionObj of versions) {
      if (this.satisfiesConstraint(versionObj.version, constraint)) {
        return versionObj.version;
      }
    }

    return null;
  }

  /**
   * Add compatibility rule
   */
  addCompatibilityRule(componentName: string, rule: CompatibilityRule): void {
    if (!this.compatibilityRules.has(componentName)) {
      this.compatibilityRules.set(componentName, []);
    }

    this.compatibilityRules.get(componentName)!.push(rule);
  }

  /**
   * Get component changelog
   */
  getChangelog(componentName: string): ChangelogEntry[] {
    const versions = this.getAllVersions(componentName);
    const changelog: ChangelogEntry[] = [];

    for (const version of versions) {
      changelog.push(...version.metadata.changelog);
    }

    return changelog.sort((a, b) => this.compareVersions(b.version, a.version));
  }

  /**
   * Get version statistics
   */
  getVersionStats(componentName?: string): {
    componentName?: string;
    totalVersions: number;
    latestVersion?: string;
    deprecatedVersions: number;
    totalComponents?: number;
    deprecated?: ComponentVersion[];
    componentsWithMultipleVersions?: string[];
    hasBreakingChanges?: boolean;
    dependencies?: ComponentDependency[];
  } {
    if (componentName) {
      const versions = this.getAllVersions(componentName);
      return {
        componentName,
        totalVersions: versions.length,
        latestVersion: versions[0]?.version,
        deprecatedVersions: versions.filter(v => v.deprecated).length,
        hasBreakingChanges: versions.some(v => v.breakingChanges && v.breakingChanges.length > 0),
        dependencies: versions[0]?.dependencies || [],
      };
    }

    // Global stats
    const allComponents = Array.from(this.versions.keys());
    return {
      totalComponents: allComponents.length,
      totalVersions: allComponents.reduce((sum, name) => sum + this.getAllVersions(name).length, 0),
      componentsWithMultipleVersions: allComponents.filter(
        name => this.getAllVersions(name).length > 1
      ),
      deprecatedVersions: allComponents.reduce(
        (sum, name) => sum + this.getAllVersions(name).filter(v => v.deprecated).length,
        0
      ),
    };
  }

  private resolveVersion(componentName: string, version?: string): string | null {
    if (!version || version === 'latest') {
      return this.defaultVersions.get(componentName) || null;
    }

    // Check if it's an alias
    const aliasKey = `${componentName}@${version}`;
    const aliasTarget = this.aliases.get(aliasKey);
    if (aliasTarget) {
      return aliasTarget.split('@')[1] || null;
    }

    return version;
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart !== bPart) {
        return aPart - bPart;
      }
    }

    return 0;
  }

  private findMigrationPath(
    componentName: string,
    fromVersion: string,
    toVersion: string
  ): string[] {
    // Simple direct path check first
    const directPath = `${componentName}:${fromVersion}->${toVersion}`;
    if (this.migrations.has(directPath)) {
      return [directPath];
    }

    // Return empty if no direct path
    return [];
  }

  private setupDefaultAliases(): void {
    // Common version aliases
    this.registerAlias('*', 'stable', 'latest');
    this.registerAlias('*', 'beta', 'latest');
  }

  /**
   * Set version for a component
   */
  setVersion(componentName: string, version: string): void {
    this.defaultVersions.set(componentName, version);
  }

  /**
   * Check if component version is compatible
   */
  isCompatible(componentName: string, requiredVersion: string): boolean {
    const currentVersion = this.getVersion(componentName);
    if (!currentVersion) {
      return false;
    }

    // Simple semantic version compatibility check
    const current = currentVersion.split('.').map(Number);
    const required = requiredVersion.split('.').map(Number);

    // Major version must match
    if (current[0] !== required[0]) {
      return false;
    }

    // Minor version must be >= required
    if ((current[1] || 0) < (required[1] || 0)) {
      return false;
    }

    // Patch version must be >= required if minor versions are equal
    if (current[1] === required[1] && (current[2] || 0) < (required[2] || 0)) {
      return false;
    }

    return true;
  }
}

// Migration function type
type MigrationFunction = (
  props: Record<string, unknown>,
  context: {
    componentName: string;
    fromVersion: string;
    toVersion: string;
  }
) => Promise<{
  props: Record<string, unknown>;
  warnings?: string[];
  manualStepsRequired?: boolean;
}>;

// Compatibility rule type
type CompatibilityRule = (
  fromVersion: ComponentVersion,
  toVersion: ComponentVersion
) => {
  issues: CompatibilityIssue[];
  recommendations: string[];
} | null;

// Export singleton instance
export const componentVersioningService = new ComponentVersioningService();

// Export types
export type {
  ComponentVersion,
  ComponentMetadata,
  BreakingChange,
  ComponentDependency,
  ChangelogEntry,
  MigrationResult,
  CompatibilityCheck,
  CompatibilityIssue,
  VersionConstraint,
  MigrationFunction,
  CompatibilityRule,
};

// Default export
export default componentVersioningService;
