# WoWPlaystyle: Modular Playstyles Design Document
### A Mechanical Proof-of-Concept for Horizontal Progression in Legacy MMOs

This document is an architectural and mechanical proof-of-concept exploring **Horizontal Progression** within legacy MMO engines. Rather than expanding vertical power (stat bloat, gear score treadmills), these designs treat equipment as **operational verbs** that grant new mechanical toolsets. 

Every playstyle below is constructed using **"Digital Duct Tape"**: repurposing legacy engine primitives (invisible dummy entities, aura stacking, collision boxes, and coordinate translation) without altering core server physics. Furthermore, each set requires cross-discipline crafting cooperation across the entire player economy to restore.

---

## Table of Contents
1. [Paladin: Sunbreaker Artillery](#1-paladin-sunbreaker-artillery)
2. [Rogue: Frontline Chirurgeon](#2-rogue-frontline-chirurgeon)
3. [Warlock: Symbiotic Host](#3-warlock-symbiotic-host)
4. [Warrior: Lodestone Colossus](#4-warrior-lodestone-colossus)
5. [Shaman: Harmonic Resonance Weaver](#5-shaman-harmonic-resonance-weaver)
6. [Priest: Twilight Arbiter](#6-priest-twilight-arbiter)
7. [Mage: Arcane Architect](#7-mage-arcane-architect)
8. [Hunter: Apex Tactician](#8-hunter-apex-tactician)
9. [Druid: Grove Architect](#9-druid-grove-architect)

---

## 1. Paladin: Sunbreaker Artillery
**Concept:** Shifts the Paladin from a front-line melee fighter into a heavy holy mortar platform, anchoring into position to bombard distant coordinates.

### The Core Mechanics
* **The Shift:** Consecration is no longer cast at the Paladin's feet; it becomes a long-range ground-targeted mortar strike.
* **The Synergy:** Anchoring in place charges holy ammunition over time. Casting Judgment detonates active Consecration zones for massive holy cleave damage.
* **The Payoff:** Expending maximum holy charges unleashes a continuous orbital barrage, decimating clustered enemy formations while locking the Paladin in place.

### The Sunbreaker Armaments
* **Trinket (Solar Lens):** Converts Consecration into a targeted ballistic strike.
  * *Restoration:* Master Jewelcrafter cuts a resonant focus crystal; Master Blacksmith builds a reinforced brass gimbal mount.
* **Boots (Anchor Sabatons):** Locks movement in exchange for rapid holy energy generation.
  * *Restoration:* Blacksmith forges heavy grounding spurs; Leatherworker crafts shock-absorbing hydraulic lining.
* **Weapon (Judgment Mortar):** Detonates active zones with Judgment.
  * *Restoration:* Engineer crafts rifled bore housing; Enchanter imbues solar combustion glyphs.

### Legacy Engine Audit ("Digital Duct Tape")
* **Ballistic Consecration:** Standard ground-target reticle passes $(X, Y, Z)$ coordinates. Server instantly spawns an invisible, unkillable dummy NPC that immediately channels standard Consecration at that coordinate point.
* **Impact Detonation:** Judgment applies a hidden aura trigger. If an entity with the aura stands within radius of an active Consecration dummy ID, it fires a localized Holy Nova proc.

---

## 2. Rogue: Frontline Chirurgeon
**Concept:** Redefines the Rogue from a stealth burst assassin into a high-tempo battlefield medic who uses stealth and mobility to perform triage.

### The Core Mechanics
* **The Shift:** Combo points are generated through aggressive melee combat but expended on surgical support abilities and sutures applied to allies.
* **The Synergy:** Vanish and Sprint become rapid repositioning tools to reach critical raid members with immunity to interception.
* **The Payoff:** Expending 5 combo points on an ally applies adrenaline stimulants, converting incoming lethal damage into a staggered bleed while granting temporary haste.

### The Chirurgeon's Kit
* **Gloves (Surgical Grips):** Allows combo points to be spent on friendly targets for burst triage.
  * *Restoration:* Master Leatherworker treats fine supple leather; Alchemist bathes material in sterile numbing tincture.
* **Belt (Cauterizing Rig):** Vanish resets mobility cooldowns and cleanses debuffs from nearby allies.
  * *Restoration:* Master Engineer crafts quick-release pneumatic valves; Blacksmith fits cold-iron buckle clamps.
* **Daggers (Scalpel Pair):** Melee attacks siphon vitality charges to fuel healing finishers.
  * *Restoration:* Master Blacksmith hones obsidian-honed edges; Enchanter etches life-stealing transfer runes.

### Legacy Engine Audit ("Digital Duct Tape")
* **Friendly Finisher Targeting:** Finisher spells check target friendly flag. If target is friendly, regular combo points on the player's internal resource counter are consumed, triggering an instant positive healing script.
* **Damage Stagger:** Native debuff that converts single-instance burst damage into periodic dot ticks, utilizing the engine's built-in DoT mitigation tables.

---

## 3. Warlock: Symbiotic Host
**Concept:** Refocuses the Warlock from a backline pet-manager into a shape-shifting, demonic hybrid who treats summoned demons as equippable loadout matrices.

### The Core Mechanics
* **The Shift:** Demonic Synthesis consumes the active demon, transforming the Warlock into a hybrid melee/caster form tailored to the absorbed pet (Voidwalker = plate tank; Imp = rapid mobility fire caster; Felhunter = magic counter).
* **The Synergy:** Maintenance drain constantly ticks down health, countered by an inverted Life Tap that burns mana to halt the physical degradation.
* **The Payoff:** Purge Host violently ejects the demon outward in a point-blank AoE shadow detonation.

### The Flesh-Pact Regalia
* **Belt (Ruptured Binding Girdle):** Unlocks Demonic Synthesis.
  * *Restoration:* Leatherworker replaces corrupted leather with purified demon hide; Blacksmith forges cold-iron clasps.
* **Shoulders (Parasitic Mantle of the Summoner):** Inverts Life Tap into a mana-draining stabilizer.
  * *Restoration:* Alchemist brews a potent sedative to suppress the living fabric; Tailor stitches containment seams with silver thread.
* **Weapon (Pact-Breaker's Sickle):** Unlocks Purge Host AoE detonation and demon re-summoning.
  * *Restoration:* Blacksmith re-tempers blade in consecrated holy water; Enchanter carves outwardly directed warding runes.

### Legacy Engine Audit ("Digital Duct Tape")
* **Demonic Synthesis:** Pet is despawned via script; player is granted a specific "Stance/Form" aura utilizing Druid shapeshifting mechanics that hot-swaps action bars and applies armor multipliers.
* **Purge Host:** Macro script sequence: 1) Cancels shapeshift aura; 2) Casts instant player-centered Arcane Explosion clone with shadow damage ID; 3) Executes instant-cast, zero-mana pet summon script.

---

## 4. Warrior: Lodestone Colossus
**Concept:** Moves the Warrior from a basic brawler into an active combat tracker managing spatial geometry and pawn positioning.

### The Core Mechanics
* **The Shift:** Charge and Intercept become ground-targeted or ally-targeted, applying kinetic barrier shields upon impact.
* **The Synergy:** Thunder Clap spends high Rage to drop a localized Gravity Well that physically draws in all nearby enemies over time.
* **The Payoff:** Striking an enemy inside the well with Shield Slam detonates the vortex, launching enemies upward with a shockwave stun.

### The Gravitic Bastion Set
* **Trinket (Depleted Lodestone Core):** Converts Thunder Clap into a persistent pull zone.
  * *Restoration:* Master Engineer builds gyroscopic containment shell; Blacksmith forges heavy alloy belt mounting.
* **Boots (Crater-Forged Treads):** Grants coordinate targeting and ally shields to Charge/Intercept.
  * *Restoration:* Leatherworker crafts impact-dampening interior padding; Alchemist synthesizes kinetic dampening gel.
* **Shield (Fractured Meteorite Bulwark):** Enables Shield Slam detonation and vertical knock-up.
  * *Restoration:* Jewelcrafter cuts flawless resonating diamond core; Enchanter binds gem to meteorite iron with gravity runes.

### Legacy Engine Audit ("Digital Duct Tape")
* **The Gravity Well:** Continuous physical vacuum dragging breaks legacy server ticks. Instead, Thunder Clap spawns an invisible, unkillable "Anchor" NPC pulsing an unavoidable AoE taunt, overriding mob AI pathing to force them to run directly inward.
* **Shockwave Detonation:** Shield Slam despawns Anchor dummy and executes a native Z-axis velocity impulse (identical to devilsaur stomp scripts) rather than horizontal vector calculations.

---

## 5. Shaman: Harmonic Resonance Weaver
**Concept:** Transforms the Shaman from a static party buffer into an active signal processor coordinating overlapping waveforms across the battlefield.

### The Core Mechanics
* **The Shift:** Totems act as continuous elemental frequency oscillators rather than passive aura sticks.
* **The Synergy:** Overlapping waves create zones of "Constructive Interference" where players gain extreme amplified effects.
* **The Payoff:** Hitting an active totem with Phase Shift violently reverses its polarity, turning healing frequencies into offensive concussive blasts.

### The Earth-Singer's Signal Chain
* **Trinket (Dormant Tuning Fork of the Ancestors):** Converts totems into frequency emitters.
  * *Restoration:* Blacksmith reheats and straightens fork tines; Jewelcrafter mounts amplification quartz.
* **Chest (Vestments of the Phase-Catcher):** Expands frequency radius and highlights active interference nodes.
  * *Restoration:* Leatherworker insulates grounding liner; Engineer weaves conductive copper antenna array through the scales.
* **Weapon (Thunder-Striker's Baton):** Enables melee-range polarity inversion.
  * *Restoration:* Enchanter charges shaft with pure lightning; Alchemist applies impact-sparking reactive resin.

### Legacy Engine Audit ("Digital Duct Tape")
* **Constructive Interference:** Older engines cannot calculate intersecting waveforms. Instead, each totem pulses a standard invisible aura radius. Server runs conditional checks: if a unit possesses Aura A (Fire) and Aura B (Water), the game awards hidden Aura C (Resonance).
* **Polarity Inversion:** Friendly totem auto-attacks are blocked natively. Baton strike is an instant-cast utility spell that despawns the target totem NPC and spawns an alternate-ID totem in identical coordinates with inverse spell scripts.

---

## 6. Priest: Twilight Arbiter
**Concept:** Moves the Priest away from binary Light/Shadow specializations into a dual-target lifeline coordinator managing linked damage and healing.

### The Core Mechanics
* **The Shift:** Twilight Tether links an ally and an enemy together in biological parity.
* **The Synergy:** Damage taken by the enemy heals the linked ally; direct heals pumped into the ally damage the enemy.
* **The Payoff:** Sever the Scales snaps all active links, executing the enemy if the ally's health is lower, or burst-healing the ally if the enemy's health is lower.

### The Scales of Equilibrium Set
* **Trinket (Frayed Cord of Duality):** Replaces Mind Flay with the primary tether mechanism.
  * *Restoration:* Tailor re-spins woven light and shadow threads; Jewelcrafter mounts onyx-pearl stabilizing clasp.
* **Headpiece (Mitre of the Weeping Judge):** Allows up to three simultaneous tether pairs.
  * *Restoration:* Blacksmith reforges lattice silver; Alchemist prepares neutralizing cleansing solvent.
* **Weapon (Gavel of the Final Verdict):** Unlocks Sever the Scales execution mechanic.
  * *Restoration:* Engineer balances mace head with internal gyroscopic weight; Enchanter imbues tether-severing enchantments.

### Legacy Engine Audit ("Digital Duct Tape")
* **Dual Targeting:** Legacy engines only select one target at a time. The system splits the tether into a two-step cast: Step 1 casts "Anchor" buff on an ally; Step 2 casts "Tether" debuff on enemy. Backend assigns paired index IDs.
* **Combat Hook:** Combat log listener detects damage on the tethered enemy ID and fires a direct heal trigger at the paired anchor ally ID. Sever the Scales runs a basic HP% comparison check before triggering the respective spell ID.

---

## 7. Mage: Arcane Architect
**Concept:** Transforms the Mage from a static ranged turret into a spatial network engineer routing spells through dynamic waypoints.

### The Core Mechanics
* **The Shift:** Direct targeting is abandoned; the Mage deploys a network of floating Arcane Relays across the field.
* **The Synergy:** Spells cast into a relay duplicate and route across all connected nodes, firing around line-of-sight obstacles.
* **The Payoff:** Feedback Loop overloads all active nodes, creating a chaining web of destruction before shattering the network.

### The Ley-Line Weaver Set
* **Trinket (Shattered Prism of the Router):** Replaces Arcane Missiles with Deploy Relay.
  * *Restoration:* Jewelcrafter facets internal geometry; Enchanter aligns internal leyline channels.
* **Shoulders (Singed Mantle of the Node-Walker):** Converts Blink into an instantaneous positional swap with any active relay.
  * *Restoration:* Tailor weaves phase-spider silk lining; Alchemist infuses stabilizing mana wash.
* **Staff (Severed Conduit of the Nexus):** Unlocks the Feedback Loop overloading detonation.
  * *Restoration:* Enchanter carves mana routing bore; Engineer installs heat-dissipation venting ports.

### Legacy Engine Audit ("Digital Duct Tape")
* **Relay Casting:** Relays spawn as stationary, friendly totem/pet NPCs. Targeting a relay intercepts the cast and commands all active relay IDs to simultaneously cast the identical spell at the closest hostile entity in range.
* **Node Blink:** Engine executes standard coordinate extraction: captures $(X_1, Y_1, Z_1)$ of the Mage and $(X_2, Y_2, Z_2)$ of the targeted relay, swapping positions in a single server tick.
* **Feedback Loop:** Employs native Chain Lightning logic: Relay A casts to Relay B, which jumps to Relay C with expanded beam thickness and AoE radius before triggering unit death scripts.

---

## 8. Hunter: Apex Tactician
**Concept:** Treats the battlefield like a tactical chess board, turning pet automation into coordinate-based pawn control and traps into an interconnected grid.

### The Core Mechanics
* **The Shift:** Standard pet attack commands are replaced by Pawn Command (instant coordinate pet teleportation).
* **The Synergy:** Traps do not detonate on enemy contact; pets moving over traps absorb their elemental payload to become living hazards.
* **The Payoff:** Enemies damaged within the grid receive a "Bloodied" status overlay. Pet melee strikes against Bloodied targets consume charges for devastating executions and reset trap cooldowns.

### The Tracker’s Gambit Set
* **Trinket (Tangled Spool of the Broodmother):** Disables auto-detonation and links traps into a grid zone.
  * *Restoration:* Alchemist dissolves corrosive venom coatings; Engineer builds tension-calibrated deployment housing.
* **Headpiece (Cracked Whistle of the Beast-Lord):** Replaces pet commands with Pawn Command.
  * *Restoration:* Jewelcrafter carves resonant whistle crystal; Leatherworker binds whistle with reinforced beast hide strap.
* **Crossbow (Splintered Arbalest of the Blood-Tracker):** Applies Bloodied execution status overlay.
  * *Restoration:* Blacksmith casts high-tension firing cam; Enchanter weaves quarry-tracking runes into string.

### Legacy Engine Audit ("Digital Duct Tape")
* **Pawn Translation:** Uses ground-reticle targeting to pass destination coordinates, instantly translating pet coordinates $(X, Y, Z)$ and clearing default follow-path logic.
* **Trap Grid:** Traps act as stationary aura emitters. Stepping onto trap coordinates despawns the trap game object and applies an elemental aura buff to the pet.
* **Bloodied Check:** Server runs a continuous loop on enemies within trap aura radii. If $HP\% < 20\%$, Bloodied debuff is applied. Pet melee strikes check for both the pet elemental buff and target Bloodied state before triggering execution code.

---

## 9. Druid: Grove Architect
**Concept:** Shifts the Druid from a reactive healer into a proactive terraformer who dynamically manipulates encounter geometry and artificial choke points.

### The Core Mechanics
* **The Shift:** Entangling Roots constructs an impassable, Line-of-Sight blocking Bramble Wall along a coordinate line.
* **The Synergy:** Casting AoE spells directly on the wall triggers Ecosystem Mutations (Tranquility creates a healing canopy; Hurricane spawns striking lashers).
* **The Payoff:** Controlled Burn ignites constructs with Moonfire, causing massive AoE fire detonations and leaving fertile ash that permanently boosts ally speed and resource regeneration.

### The Overgrowth Engine Set
* **Trinket (Fossilized Seed of the Progenitor):** Converts Entangling Roots into Bramble Wall generation.
  * *Restoration:* Alchemist synthesizes volatile germination serum; Leatherworker crafts reinforced loam-pouch.
* **Shoulders (Petrified Bark-Weave Mantle):** Enables Ecosystem Mutations on deployed walls.
  * *Restoration:* Tailor weaves living dream-silk into joints; Enchanter animates bark with nature spirits.
* **Staff (Branch of the Ashen World-Tree):** Unlocks Controlled Burn detonation and fertile ash buffing.
  * *Restoration:* Blacksmith constructs thermal-venting ironwood grip; Jewelcrafter inserts radiant heat sun-stone.

### Legacy Engine Audit ("Digital Duct Tape")
* **Bramble Wall:** Older engines cannot dynamically alter terrain navmeshes. The spell calculates the cast angle and spawns an array of 3 to 5 overlapping, static game objects possessing collision meshes and native "Blocks Line of Sight" flags.
* **Ecosystem Mutation:** Proximity check triggers on the wall objects when caught in Hurricane/Tranquility radius, instantly despawning default wall entities and spawning alternate-ID entities with damage or healing auras.
* **Controlled Burn:** Moonfire acts as an interaction trigger that despawns the wall collision meshes, plays an explosion particle effect, and spawns an invisible "Ash Patch" dummy NPC pulsing movement speed and mana regeneration auras.
