# WoWPlaystyle design document

These nine playstyles are about horizontal progression: gear that changes what your class does, not how big its numbers are. Each set drops broken, and it takes several professions working together to restore it, so a playstyle is something the whole server economy builds.

Every design also comes with a note on how an old MMO engine could run it with tools it already has: invisible dummy NPCs, hidden auras, collision objects and coordinate swaps. None of it needs new server physics.

Every playstyle here is also in the app under **Examples**, with the same item names and text.

## Contents

1. [Paladin - Sunbreaker Artillery](#paladin---sunbreaker-artillery)
2. [Rogue - Frontline Chirurgeon](#rogue---frontline-chirurgeon)
3. [Warlock - Symbiotic Host](#warlock---symbiotic-host)
4. [Warrior - Lodestone Colossus](#warrior---lodestone-colossus)
5. [Shaman - Harmonic Resonance Weaver](#shaman---harmonic-resonance-weaver)
6. [Priest - Twilight Arbiter](#priest---twilight-arbiter)
7. [Mage - Arcane Architect](#mage---arcane-architect)
8. [Hunter - Apex Tactician](#hunter---apex-tactician)
9. [Druid - Grove Architect](#druid---grove-architect)

## Paladin - Sunbreaker Artillery

The Paladin stops being a melee fighter and becomes a holy mortar. You pick a spot, hold your position and shell the enemy from range.

Judgment becomes a ground-targeted strike, and Consecration follows it, landing wherever your last Judgment hit. Holy Shock on an enemy standing in that Consecration blows the whole zone up and resets Judgment, so the rotation is a loop of marking ground and detonating it. With all three pieces, every ground-targeted spell gets a 20% larger radius.

Set: Sunbreaker Artillery. (3) The radius of your ground-targeted spells is increased by 20%.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Restored Sun-Lens | Trinket | Converts Judgment into a ground-targeted AoE ability. | Master Alchemist & Enchanter |
| Pauldrons of the Dawn | Shoulder | Causes Consecration to deploy at the location of your most recent Judgment. | Master Blacksmith & Leatherworker |
| Scepter of the Sun King | 1-Handed Mace | Casting Holy Shock on an enemy standing in Consecration detonates the zone for massive AoE damage and resets Judgment. | Alchemist & Enchanter |

### How it could work in the old engine

- The ground-target reticle passes X, Y and Z coordinates. The server spawns an invisible, unkillable dummy NPC there, and the dummy channels an ordinary Consecration.
- Holy Shock checks whether its target stands inside the radius of an active Consecration dummy. If it does, it fires a local Holy Nova proc at that spot.

## Rogue - Frontline Chirurgeon

The Rogue becomes a combat medic who stays in the melee scrum. Your attacks build up healing, and your finishers spend it on allies.

Combo-point generators also store Vials, healing charges sized by the damage you deal. Finishers can then target a friendly player, and the heal grows with the combo points and Vials you put into it. The daggers add Defibrillating Strike as an emergency heal, and your auto-attacks keep topping up the lowest-health ally next to you. With the full set, Defibrillating Strike also shields its target.

Set: Blood-Alchemist's Kit. (3) Defibrillating Strike applies a 15% damage reduction shield to the target for 6 seconds.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Syringe-Belt of the Apothecary | Waist | Converts combo-point generators into abilities that passively store healing charges (Vials) based on damage dealt. | Master Engineer & Alchemist |
| Triage Goggles | Head | Unlocks the ability to target allies with finishing moves, scaling the heal based on the combo points and Vials allocated to the cast. | Master Jewelcrafter & Leatherworker |
| Bone-Saws of the Flesh-Shaper | Dual Daggers | Enables the Defibrillating Strike emergency heal. Auto-attacks passively heal the lowest-health ally in your immediate melee vicinity. | Master Blacksmith & Enchanter |

### How it could work in the old engine

- Finishers check the target's friendly flag. On a friendly target they still spend the combo points from the player's normal resource counter, then run an instant healing script instead of a damage one.

## Warlock - Symbiotic Host

The Warlock stops fighting next to a demon and starts wearing one. You absorb your pet and take on its strengths in a hybrid demonic form.

Demonic Synthesis consumes the active demon. A Voidwalker gives you plate-level armor and melee cleaves, an Imp gives you rapid-fire mobility spells, and a Felhunter gives you magic immunity and silences. The form drains your health while it lasts, and Life Tap now runs backwards, burning mana to hold the drain off. When you're done, Purge Host throws the demon out of your body in a shadow explosion. With all three pieces, that explosion also fears everything nearby.

Set: Flesh-Pact Regalia. (3) Purge Host now also fears all enemies within 8 yards for 3 seconds.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Flesh-Pact Girdle | Waist | Unlocks Demonic Synthesis. Absorbing a Voidwalker grants plate-level armor and melee cleaves. Absorbing an Imp grants rapid-fire mobility spells. Absorbing a Felhunter grants magic immunity and silences. | Master Leatherworker & Blacksmith |
| Flesh-Pact Mantle | Shoulder | Alters Life Tap. Instead of draining health for mana, it rapidly drains mana to temporarily halt the lethal health-drain of the Symbiotic state. | Alchemist & Tailor |
| Cleansed Pact-Breaker's Sickle | 1-Handed Sickle | Unlocks Purge Host. Instantly ends Demonic Synthesis, violently ejecting the demon from your body to cause a massive AoE shadow explosion. | Master Blacksmith & Enchanter |

### How it could work in the old engine

- Demonic Synthesis despawns the pet by script and gives the player a stance or form aura, borrowing the Druid shapeshift system to swap action bars and apply armor multipliers.
- Purge Host is a three-step script: cancel the form aura, cast an instant player-centered Arcane Explosion clone that deals shadow damage, then resummon the pet instantly at no mana cost.

## Warrior - Lodestone Colossus

The Warrior becomes the one who decides where everyone stands. You pull enemies into place, leap to wherever you're needed, and then blow the cluster apart.

Thunder Clap spends extra Rage to leave a Gravity Well that keeps dragging enemies inward. Charge and Intercept can target a spot on the ground or an ally, and you land with a kinetic barrier. Once the well has done its work, Shield Slam detonates it and launches everything inside upward with a stun. With all three pieces, the launch goes 5 yards higher.

Set: Gravitic Bastion. (3) Shield Slam detonations knock enemies an additional 5 yards into the air.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| The Singularity Anchor | Trinket | Alters Thunder Clap to consume extra Rage, creating a persistent Gravity Well effect that pulls enemies inward. | Master Engineer & Blacksmith |
| Kinetic Sabatons | Feet | Converts Charge and Intercept into coordinate-targeted or ally-targeted abilities, applying a kinetic barrier upon landing. | Master Leatherworker & Alchemist |
| The Event Horizon | Shield | Detonates active Gravity Wells with Shield Slam, converting absorbed kinetic energy into an AoE knock-up and stun. | Master Jewelcrafter & Enchanter |

### How it could work in the old engine

- Dragging enemies continuously would break old server ticks. Instead, Thunder Clap spawns an invisible, unkillable Anchor NPC that pulses an unavoidable AoE taunt, so mob AI paths straight in toward it.
- Shield Slam despawns the Anchor and applies a vertical velocity impulse, the same kind the devilsaur stomp scripts use, with no horizontal vector math.

## Shaman - Harmonic Resonance Weaver

The Shaman's totems become signal emitters instead of passive buff sticks. You place them so their waves overlap, and you flip them between healing and harm.

Each totem sends out a visible pulse wave. Where waves from different totems overlap, players inside get a much stronger effect, and the chest piece makes those overlap zones bigger and easier to see. The baton lets you strike your own totem to reverse it, turning a healing wave into a sonic blast or the other way round. With all three pieces, that strike also makes the totem fire an extra echo wave at once.

Set: Earth-Singer's Signal Chain. (3) Striking a totem with Phase Shift causes it to emit an immediate secondary echo wave.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Resonant Tuning Fork | Trinket | Converts standard totems into frequency emitters, creating a visual pulse wave on the ground. | Master Blacksmith & Jewelcrafter |
| Grounded Vestments of the Phase-Catcher | Chest | Increases the radius of totem waveforms and visually illuminates the interference patterns on the ground. | Master Leatherworker & Engineer |
| Charged Thunder-Striker's Baton | 1-Handed Mace | Unlocks Phase Shift. Strike an active totem to violently reverse its polarity, converting heals to offensive sonic booms or vice versa. | Enchanter & Alchemist |

### How it could work in the old engine

- Old engines can't calculate intersecting waves. Each totem pulses an ordinary invisible aura instead, and the server checks combinations: a unit with the Fire aura and the Water aura also gets a hidden Resonance aura.
- The engine blocks auto-attacks on friendly totems, so the baton strike is an instant utility spell. It despawns the targeted totem and spawns a different totem ID at the same coordinates, with the opposite spell scripts.

## Priest - Twilight Arbiter

The Priest stops picking between Light and Shadow and starts moving health between people. You tie an ally and an enemy together so that what happens to one happens in reverse to the other.

Twilight Tether replaces Mind Flay. Damage to the tethered enemy heals the ally, and healing the ally damages the enemy. The headpiece lets you keep three tethers up at once. Sever the Scales snaps all of them: whichever side is worse off decides whether it executes the enemy or burst-heals the ally. With all three pieces, a successful execute gives back half the mana.

Set: Scales of Equilibrium. (3) Sever the Scales refunds 50% of its mana cost if it successfully executes an enemy.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Cord of Duality | Trinket | Replaces Mind Flay with Twilight Tether, allowing you to link an ally and an enemy. Damage to the enemy heals the ally, and healing the ally damages the enemy. | Master Tailor & Jewelcrafter |
| Mitre of the Weeping Judge | Head | Allows you to maintain up to three separate Twilight Tethers simultaneously. | Master Blacksmith & Alchemist |
| Gavel of the Final Verdict | 1-Handed Mace | Unlocks Sever the Scales. Snaps all active tethers instantly to execute the enemy or burst heal the ally based on health deficits. | Master Engineer & Enchanter |

### How it could work in the old engine

- Old engines only let you hold one target, so the tether is a two-step cast: an Anchor buff on the ally, then a Tether debuff on the enemy. The server gives the pair matching index IDs.
- A combat log listener watches for damage on the tethered enemy's ID and fires a direct heal at the paired ally's ID. Sever the Scales compares the two health percentages and casts whichever spell ID applies.

## Mage - Arcane Architect

The Mage stops casting straight at targets and builds a network instead. You place floating relays around the fight and route spells through them from behind cover.

Deploy Relay replaces Arcane Missiles and lets you place up to three crystal nodes. A spell cast into a relay is copied out of every node in the network, so you can hit things you can't see. Blink no longer moves you forward; it swaps you with any relay. Feedback Loop overloads the whole network so the relays chain damage between each other before they shatter. With all three pieces, Feedback Loop hits 15% harder on anything inside the network.

Set: Ley-Line Weaver. (3) Feedback Loop deals 15% increased damage to targets caught inside the relay network.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Prism of the Router | Trinket | Replaces Arcane Missiles with Deploy Relay, allowing you to place up to three floating crystal nodes. | Master Jewelcrafter & Enchanter |
| Mantle of the Node-Walker | Shoulder | Upgrades Blink. Instead of blinking a set distance forward, you instantly swap physical positions with any active Arcane Relay. | Master Tailor & Alchemist |
| Conduit of the Nexus | Staff | Unlocks Feedback Loop. Overload the network, causing deployed relays to chain massive damage between each other before shattering. | Master Enchanter & Engineer |

### How it could work in the old engine

- Relays are stationary friendly NPCs, like totems or pets. Targeting a relay intercepts the cast and orders every active relay ID to cast the same spell at the nearest enemy in range.
- Node Blink reads the X, Y, Z position of the Mage and of the chosen relay, then swaps them in a single server tick.
- Feedback Loop reuses Chain Lightning logic: relay A casts to relay B, which jumps to relay C with a thicker beam and a larger radius, and then the relays run their death scripts.

## Hunter - Apex Tactician

The Hunter treats the fight like a board game. Your pet stops running on its own AI and becomes a piece you move, and your traps link into a grid.

Traps no longer go off when an enemy steps on them; they link into a grid that controls the area. Pawn Command replaces the normal pet attack orders, so you send the pet to an exact spot, and when it walks over a trap it soaks up the trap's element. Enemies badly hurt inside the grid become Bloodied, and the pet can execute them. With all three pieces, each execution speeds the pet's attacks up by 30% for 10 seconds.

Set: Tracker's Gambit. (3) Executing a Bloodied target grants your pet 30% increased attack speed for 10 seconds.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Spool of the Broodmother | Trinket | Prevents traps from triggering automatically and allows them to link together into a grid. | Master Alchemist & Engineer |
| Whistle of the Beast-Lord | Head | Replaces standard pet attack commands with Pawn Command, allowing precise coordinate targeting and trap absorption. | Master Jewelcrafter & Leatherworker |
| Arbalest of the Blood-Tracker | Crossbow | Applies the 'Bloodied' status to enemies heavily damaged within the trap grid, enabling the pet's execution attack. | Master Blacksmith & Enchanter |

### How it could work in the old engine

- Pawn Command uses the ground reticle to pass a destination, moves the pet's X, Y, Z coordinates there instantly and clears its default follow path.
- Traps are stationary aura emitters. When the pet steps onto a trap's coordinates, the trap object despawns and the pet gets that element as an aura buff.
- The server loops over enemies inside trap aura radii and applies the Bloodied debuff to any below 20% health. Pet melee attacks check for both the elemental buff and the Bloodied debuff before running the execution code.

## Druid - Grove Architect

The Druid reshapes the battlefield itself. You grow walls that block movement and line of sight, change what they do, and burn them down when you need the space back.

Entangling Roots now grows a Bramble Wall that blocks movement and line of sight. Hurricane on a wall turns it into a Lasher-Bramble that deals damage, and Tranquility turns it into a Blooming-Bramble that heals. Moonfire sets a wall on fire: it vanishes, deals burst damage, and leaves an Ash Patch that gives movement speed and resource regeneration. With all three pieces, allies standing in Ash also get 15% haste.

Set: Vestments of the Grove. (3) Allies standing inside an Ash Patch gain 15% increased haste.

| Item | Slot | What it does | Restored by |
|---|---|---|---|
| Seed of the Bramble Wall | Trinket | Alters Entangling Roots to spawn a targeted Bramble Wall composed of physical collision and LoS-blocking geometry. | Master Herbalist & Alchemist |
| Mantle of the Ecosystem | Shoulder | Casting Hurricane or Tranquility on a Bramble Wall mutates it into a damage-dealing Lasher-Bramble or a restorative Blooming-Bramble. | Master Tailor & Enchanter |
| Staff of the Controlled Burn | Staff | Casting Moonfire on a Bramble Wall incinerates it, instantly removing LoS blockers, dealing burst damage, and leaving an Ash Patch that grants movement speed and resource regeneration. | Master Enchanter & Engineer |

### How it could work in the old engine

- Old engines can't change the navmesh at runtime. The spell reads the cast angle and spawns a row of three to five overlapping static objects that have collision and the engine's "blocks line of sight" flag.
- Each wall object checks whether it is inside a Hurricane or Tranquility radius. If it is, the default wall objects despawn and alternate IDs with damage or healing auras spawn in their place.
- Moonfire on a wall despawns its collision objects, plays an explosion effect and spawns an invisible Ash Patch NPC that pulses movement speed and mana regeneration auras.
