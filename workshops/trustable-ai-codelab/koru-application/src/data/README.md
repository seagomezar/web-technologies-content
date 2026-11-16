# Track Data

## Overview

Static circuit geometry and GPS Haversine geofence definitions for the Koru racing coach simulator. Provides full track metadata, sectors, 2D SVG map coordinates, and corner callouts for Thunderhill Raceway (East) alongside Sonoma Raceway corner geofences aligned with `SampleStream2024.csv` VBOX telemetry.

## Interface

- `[trackData.ts:THUNDERHILL_EAST]`: Exported `Track` constant defining `'Thunderhill Raceway (East)'` (`length: 4612`, `zoom: 16`, `center: { lat: 39.540473, lng: -122.331475 }`, `recordLap: 118.5`, 3 sectors, 5 corners with IDs `1`–`5`, and 36 `{ x, y }` `mapPoints`).
- `[trackData.ts:SONOMA_CORNERS]`: Exported `Corner[]` constant defining 6 Sonoma Raceway geofence corners (IDs `101`–`106`) with `entryDist`, `apexDist`, `exitDist`, GPS `lat`/`lon`, and corner-specific feedforward `advice`.

## Invariants

- `[trackData.ts:THUNDERHILL_EAST]`: Sectors `1`–`3` partition `[0, 4612]` contiguously (`0`–`1500`, `1500`–`3000`, `3000`–`4612`) matching `length: 4612`, and every corner (`id` `1`–`5`) satisfies `entryDist < apexDist < exitDist`.
- `[trackData.ts:SONOMA_CORNERS]`: Uses corner IDs `101`–`106` disjoint from `[trackData.ts:THUNDERHILL_EAST]` (`1`–`5`) and maintains `entryDist < apexDist < exitDist` across all 6 geofence definitions.

## Side Effects

- None (`[trackData.ts:THUNDERHILL_EAST]` and `[trackData.ts:SONOMA_CORNERS]` are static, read-only constant exports with no I/O or runtime state mutations).

## Verification

- Run: `npm run build` and `npm run lint` (in `workshops/trustable-ai-codelab/koru-application`)
