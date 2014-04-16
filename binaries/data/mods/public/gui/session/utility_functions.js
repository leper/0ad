const GEOLOGY = "geology";
const FLORA = "flora";
const FAUNA = "fauna";
const SPECIAL = "special";

const COST_DISPLAY_NAMES = {
    "food": "[icon=\"iconFood\"]",
    "wood": "[icon=\"iconWood\"]",
    "stone": "[icon=\"iconStone\"]",
    "metal": "[icon=\"iconMetal\"]",
    "population": "[icon=\"iconPopulation\"]",
    "time": "[icon=\"iconTime\"]"
};

//-------------------------------- -------------------------------- --------------------------------
// Utility functions
//-------------------------------- -------------------------------- --------------------------------

function toTitleCase(word)
{
	if (word.length > 0)
	{
		var titleCased = word.substring(0, 1).toUpperCase();

		if (word.length > 1)
		{
			titleCased += word.substring(1).toLowerCase();
		}
		return titleCased;
	}

	return word;
}

// Get the basic player data
function getPlayerData(playerAssignments)
{
	var players = [];

	var simState = GetSimState();
	if (!simState)
		return players;

	for (var i = 0; i < simState.players.length; i++)
	{
		var playerState = simState.players[i];

		var name = playerState.name;
		var civ = playerState.civ;
		var color = {
		    "r": playerState.colour.r*255,
		    "g": playerState.colour.g*255,
		    "b": playerState.colour.b*255,
		    "a": playerState.colour.a*255
		};

		var player = {
		    "name": name,
		    "civ": civ,
		    "color": color,
		    "team": playerState.team,
		    "teamsLocked": playerState.teamsLocked,
		    "cheatsEnabled": playerState.cheatsEnabled,
		    "state": playerState.state,
		    "isAlly": playerState.isAlly,
		    "isMutualAlly": playerState.isMutualAlly,
		    "isNeutral": playerState.isNeutral,
		    "isEnemy": playerState.isEnemy,
		    "guid": undefined, // network guid for players controlled by hosts
		    "disconnected": false // flag for host-controlled players who have left the game
		};
		players.push(player);
	}

	// Overwrite default player names with multiplayer names
	if (playerAssignments)
	{
		for (var playerGuid in playerAssignments)
		{
			var playerAssignment = playerAssignments[playerGuid];
			if (players[playerAssignment.player])
			{
				players[playerAssignment.player].guid = playerGuid;
				players[playerAssignment.player].name = playerAssignment.name;
			}
		}
	}

	return players;
}

function findGuidForPlayerID(playerAssignments, player)
{
	for (var playerGuid in playerAssignments)
	{
		var playerAssignment = playerAssignments[playerGuid];
		if (playerAssignment.player == player)
			return playerGuid;
	}
	return undefined;
}

// Update player data when a host has connected
function updatePlayerDataAdd(players, hostGuid, playerAssignment)
{
	if (players[playerAssignment.player])
	{
		players[playerAssignment.player].guid = hostGuid;
		players[playerAssignment.player].name = playerAssignment.name;
		players[playerAssignment.player].offline = false;
	}
}

// Update player data when a host has disconnected
function updatePlayerDataRemove(players, hostGuid)
{
	for each (var player in players)
		if (player.guid == hostGuid)
			player.offline = true;
}

function hasClass(entState, className)
{
	if (entState.identity)
	{
		var classes = entState.identity.classes;
		if (classes && classes.length)
			return (classes.indexOf(className) != -1);
	}
	return false;
}

// For the unit details panel
function damageValues(dmg)
{
	if (dmg)
	{
		var dmgArray = [];
		dmg.hack? dmgArray.push(dmg.hack) : dmgArray.push(0);
		dmg.pierce? dmgArray.push(dmg.pierce) : dmgArray.push(0);
		dmg.crush? dmgArray.push(dmg.crush) : dmgArray.push(0);

		return dmgArray;
	}
	else
	{
		return [0, 0, 0];
	}
}

// For the unit details panel
function damageTypeDetails(dmg)
{
	if (!dmg)
		return "[font=\"serif-12\"]" + translate("(None)") + "[/font]";

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.hack,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Hack") + "[/color][/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.pierce,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Pierce") + "[/color][/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.crush,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Crush") + "[/color][/font]"
		}));

	return dmgArray.join(translate(", "));
}

function attackRateDetails(entState) {
	var time = entState.attack.repeatTime / 1000;
	if (entState.buildingAI) {
		var arrows = Math.max(entState.buildingAI.arrowCount, entState.buildingAI.defaultArrowCount);
		// TODO TODO TODO color, font
		return sprintf(translate("%(arrowString)s / %(timeString)s"), {
			arrowString: sprintf(translatePlural("%(arrows)s arrow", "%(arrows)s arrows", arrows), { arrows: arrows}),
			timeString: sprintf(translatePlural("second", "%(time)s seconds", time), { time: time }) 
		});
	}
	// TODO TODO TODO color, font
	return sprintf(translatePlural("%(time)s second", "%(time)s seconds", time), { time: time });
}

// Converts an armor level into the actual reduction percentage
function armorLevelToPercentageString(level)
{
	return (100 - Math.round(Math.pow(0.9, level) * 100)) + "%";
	// 	return sprintf(translate("%(armorPercentage)s%"), { armorPercentage: (100 - Math.round(Math.pow(0.9, level) * 100)) }); // Not supported by our sprintf implementation.
}

// Also for the unit details panel
function armorTypeDetails(dmg)
{
	if (!dmg)
		return "[font=\"serif-12\"]" + translate("(None)") + "[/font]";

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.hack,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Hack") + "[/color][/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.hack) }) + "[/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.pierce,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Pierce") + "[/color][/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.pierce) }) + "[/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.crush,
			damageType: "[font=\"sans-10\"][color=\"orange\"]" + translate("Crush") + "[/color][/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.crush) }) + "[/font]"
		}));

	return dmgArray.join(translate(", "));
}

// For the training tooltip
function damageTypesToText(dmg)
{
	if (!dmg)
		return "[font=\"serif-12\"]" + translate("(None)") + "[/font]";

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.hack,
			damageType: "[font=\"serif-12\"]" + translate("Hack") + "[/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.pierce,
			damageType: "[font=\"serif-12\"]" + translate("Pierce") + "[/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s"), {
			damage: dmg.crush,
			damageType: "[font=\"serif-12\"]" + translate("Crush") + "[/font]"
		}));

	return dmgArray.join("[font=\"serif-12\"]" + translate(", ") + "[/font]");
}

// Also for the training tooltip
function armorTypesToText(dmg)
{
	if (!dmg)
		return "[font=\"serif-12\"]" + translate("(None)") + "[/font]";

	var dmgArray = [];
	if (dmg.hack)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.hack,
			damageType: "[font=\"serif-12\"]" + translate("Hack") + "[/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.hack) }) + "[/font]"
		}));
	if (dmg.pierce)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.pierce,
			damageType: "[font=\"serif-12\"]" + translate("Pierce") + "[/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.pierce) }) + "[/font]"
		}));
	if (dmg.crush)
		dmgArray.push(sprintf(translate("%(damage)s %(damageType)s %(armorPercentage)s"), {
			damage: dmg.crush,
			damageType: "[font=\"serif-12\"]" + translate("Crush") + "[/font]",
			armorPercentage: "[font=\"sans-10\"]" + sprintf(translate("(%(armorPercentage)s)"), { armorPercentage: armorLevelToPercentageString(dmg.crush) }) + "[/font]"
		}));

	return dmgArray.join("[font=\"serif-12\"]" + translate(", ") + "[/font]");
}

function getEntityCommandsList(entState)
{
	var commands = [];
	if (entState.garrisonHolder)
	{
		commands.push({
		    "name": "unload-all",
		    "tooltip": translate("Unload All"),
		    "icon": "garrison-out.png"
		});
	}

	commands.push({
	    "name": "delete",
	    "tooltip": translate("Delete"),
	    "icon": "kill_small.png"
	});

	if (hasClass(entState, "Unit"))
	{
		commands.push({
		    "name": "stop",
		    "tooltip": translate("Stop"),
		    "icon": "stop.png"
		});
		commands.push({
		    "name": "garrison",
		    "tooltip": translate("Garrison"),
		    "icon": "garrison.png"
		});
	}

	if (entState.buildEntities)
	{
		commands.push({
		    "name": "repair",
		    "tooltip": translate("Repair"),
		    "icon": "repair.png"
		});
	}

	if (entState.rallyPoint)
	{
		commands.push({
		    "name": "focus-rally",
		    "tooltip": translate("Focus on Rally Point"),
		    "icon": "focus-rally.png"
		});
	}

	if (entState.unitAI && entState.unitAI.hasWorkOrders)
	{
		commands.push({
		    "name": "back-to-work",
		    "tooltip": translate("Back to Work"),
		    "icon": "production.png"
		});
	}

	if (entState.unitAI && entState.unitAI.canGuard && !entState.unitAI.isGuarding)
	{
		commands.push({
		    "name": "add-guard",
		    "tooltip": translate("Guard"),
		    "icon": "add-guard.png"
		});
	}

	if (entState.unitAI && entState.unitAI.isGuarding)
	{
		commands.push({
		    "name": "remove-guard",
		    "tooltip": translate("Remove guard"),
		    "icon": "remove-guard.png"
		});
	}

	if (hasClass(entState, "Market"))
	{
		commands.push({
		    "name": "select-trading-goods",
		    "tooltip": translate("Select trading goods"),
		    "icon": "economics.png"
		});
	}

	if(entState.alertRaiser)
	{
		if(entState.alertRaiser.canIncreaseLevel)
		{
			if(entState.alertRaiser.hasRaisedAlert)
				var tooltip = translate("Increase the alert level to protect more units");
			else
				var tooltip = translate("Raise an alert!");
			commands.push({
				"name": "increase-alert-level",
				"tooltip": tooltip,
				"icon": "bell_level1.png"
			});
		}

		if(entState.alertRaiser.hasRaisedAlert)
			commands.push({
				"name": "alert-end",
				"tooltip": translate("End of alert."),
				"icon": "bell_level0.png"
			});
	}

	return commands;
}

/**
 * Translates a cost component identifier as they are used internally (e.g. "population", "food", etc.) to proper
 * display names.
 */
function getCostComponentDisplayName(costComponentName)
{
	return COST_DISPLAY_NAMES[costComponentName];
}

/**
 * Multiplies the costs for a template by a given batch size.
 */
function multiplyEntityCosts(template, trainNum)
{
	var totalCosts = {};
	for (var r in template.cost)
		totalCosts[r] = Math.floor(template.cost[r] * trainNum);

	return totalCosts;
}

/**
 * Helper function for getEntityCostTooltip.
 */
function getEntityCostComponentsTooltipString(template, trainNum, entity)
{
	if (!trainNum)
		trainNum = 1;

	var totalCosts = multiplyEntityCosts(template, trainNum);
	totalCosts.time = Math.ceil(template.cost.time * (entity ? Engine.GuiInterfaceCall("GetBatchTime", {"entity": entity, "batchSize": trainNum}) : 1));

	var costs = [];
	if (totalCosts.food) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("food"), cost: totalCosts.food }));
	if (totalCosts.wood) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("wood"), cost: totalCosts.wood }));
	if (totalCosts.metal) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("metal"), cost: totalCosts.metal }));
	if (totalCosts.stone) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("stone"), cost: totalCosts.stone }));
	if (totalCosts.population) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("population"), cost: totalCosts.population }));
	if (totalCosts.time) costs.push(sprintf(translate("%(component)s %(cost)s"), { component: getCostComponentDisplayName("time"), cost: totalCosts.time }));
	return costs;
}

/**
 * Returns an array of strings for a set of wall pieces. If the pieces share
 * resource type requirements, output will be of the form '10 to 30 Stone',
 * otherwise output will be, e.g. '10 Stone, 20 Stone, 30 Stone'.
 */
function getWallPieceTooltip(wallTypes)
{
	var out = [];
	var resourceCount = {};

	// Initialize the acceptable types for '$x to $y $resource' mode.
	for (var resource in wallTypes[0].cost)
		if (wallTypes[0].cost[resource])
			resourceCount[resource] = [wallTypes[0].cost[resource]];

	var sameTypes = true;
	for (var i = 1; i < wallTypes.length; ++i)
	{
		for (var resource in wallTypes[i].cost)
		{
			// Break out of the same-type mode if this wall requires
			// resource types that the first didn't.
			if (wallTypes[i].cost[resource] && !resourceCount[resource])
			{
				sameTypes = false;
				break;
			}
		}

		for (var resource in resourceCount)
		{
			if (wallTypes[i].cost[resource])
				resourceCount[resource].push(wallTypes[i].cost[resource]);
			else
			{
				sameTypes = false;
				break;
			}
		}
	}

	if (sameTypes)
	{
		for (var resource in resourceCount)
		{
			var resourceMin = Math.min.apply(Math, resourceCount[resource]);
			var resourceMax = Math.max.apply(Math, resourceCount[resource]);

			out.push(getCostComponentDisplayName(resource) + " " + resourceMin + " to " + getCostComponentDisplayName(resource) + " " + resourceMax);
		}
	}
	else
		for (var i = 0; i < wallTypes.length; ++i)
			out.push(getEntityCostComponentsTooltipString(wallTypes[i]).join(", "));

	return out;
}

/**
 * Returns the cost information to display in the specified entity's construction button tooltip.
 */
function getEntityCostTooltip(template, trainNum, entity)
{
	var cost = "";

	// Entities with a wallset component are proxies for initiating wall placement and as such do not have a cost of
	// their own; the individual wall pieces within it do.
	if (template.wallSet)
	{
		var templateLong = GetTemplateData(template.wallSet.templates.long);
		var templateMedium = GetTemplateData(template.wallSet.templates.medium);
		var templateShort = GetTemplateData(template.wallSet.templates.short);
		var templateTower = GetTemplateData(template.wallSet.templates.tower);

		var wallCosts = getWallPieceTooltip([templateShort, templateMedium, templateLong]);
		var towerCosts = getEntityCostComponentsTooltipString(templateTower);

		cost += " " + sprintf(translate("Walls:  %(costs)s"), { costs: wallCosts.join(translate("  ")) }) + "\n";
		cost += " " + sprintf(translate("Towers:  %(costs)s"), { costs: towerCosts.join(translate("  ")) });
	}
	else if (template.cost)
	{
		var costs = getEntityCostComponentsTooltipString(template, trainNum, entity);
		cost = costs.join(translate("  "));
	}
	else
	{
		cost = ""; // cleaner than duplicating the serif-bold-13 stuff
	}

	return cost;
}

/**
 * Returns the population bonus information to display in the specified entity's construction button tooltip.
 */
function getPopulationBonusTooltip(template)
{
	var popBonus = "";
	if (template.cost && template.cost.populationBonus)
		popBonus = "\n" + sprintf(translate("%(label)s %(populationBonus)s"), {
			label: "[font=\"serif-bold-13\"]" + translate("Population Bonus:") + "[/font]",
			populationBonus: template.cost.populationBonus
		});
	return popBonus;
}

/**
 * Returns a message with the amount of each resource needed to create an entity.
 */
function getNeededResourcesTooltip(resources)
{
	var formatted = [];
	for (var resource in resources)
		formatted.push(sprintf(translate("%(component)s %(cost)s"), {
			component: "[font=\"serif-12\"]" + getCostComponentDisplayName(resource) + "[/font]",
			cost: resources[resource]
		}));

	return "\n\n[font=\"serif-bold-13\"][color=\"red\"]" + translate("Insufficient resources:") + "[/color][/font]\n" + formatted.join(translate("  "));
}

function getEntitySpeed(template)
{
	var speed = "";
	if (template.speed)
	{
		var label = "[font=\"serif-bold-13\"]" + translate("Speed:") + "[/font]";
		var speeds = [];
		if (template.speed.walk) speeds.push(sprintf(translate("%(speed)s %(movementType)s"), { speed: template.speed.walk, movementType: "[font=\"serif-12\"]" + translate("Walk") + "[/font]"}));
		if (template.speed.run) speeds.push(sprintf(translate("%(speed)s %(movementType)s"), { speed: template.speed.run, movementType: "[font=\"serif-12\"]" + translate("Run") + "[/font]"}));

		speed = sprintf(translate("%(label)s %(speeds)s"), { label: label, speeds: speeds.join(translate(", ")) })
	}
	return speed;
}

function getEntityAttack(template)
{
	var attacks = [];
	if (template.attack)
	{
		// Don't show slaughter attack
		delete template.attack['Slaughter'];
		for (var type in template.attack)
		{
			var attack = "";
			var attackLabel = "[font=\"serif-bold-13\"]" + getAttackTypeLabel(type) + "[/font]";
			if (type == "Ranged")
			{
				// Show max attack range if ranged attack, also convert to tiles (4m per tile)
				attack = sprintf(translate("%(attackLabel)s %(damageTypes)s, %(rangeLabel)s %(range)s"), {
					attackLabel: attackLabel,
					damageTypes: damageTypesToText(template.attack[type]),
					rangeLabel: "[font=\"serif-bold-13\"]" + translate("Range:") + "[/font]",
					range: Math.round(template.attack[type].maxRange/4)
				});
			}
			else
			{
				attack = sprintf(translate("%(attackLabel)s %(damageTypes)s"), {
					attackLabel: attackLabel,
					damageTypes: damageTypesToText(template.attack[type])
				});
			}
			attacks.push(attack);
		}
	}
	return attacks.join("\n");
}

function getEntityNames(template)
{
	if (template.name.specific)
    {
		if (template.name.generic && template.name.specific != template.name.generic)
			return sprintf(translate("%(specificName)s (%(genericName)s)"), {
				specificName: template.name.specific,
				genericName: template.name.generic
			});
        return template.name.specific;
    }
	if (template.name.generic)
		return template.name.generic;

	warn("Entity name requested on an entity without a name, specific or generic.");
	return translate("???");
}

function getEntityNamesFormatted(template)
{
	var names = "";
	var generic = template.name.generic;
	var specific = template.name.specific;
	if (specific)
	{
		// drop caps for specific name
		names += '[font="serif-bold-16"]' + specific[0] + '[/font]' +
			'[font="serif-bold-12"]' + specific.slice(1).toUpperCase() + '[/font]';

		if (generic)
			names += '[font="serif-bold-16"] (' + generic + ')[/font]';
	}
	else if (generic)
		names = '[font="serif-bold-16"]' + generic + "[/font]";
	else
		names = "???";

	return names;
}

function getEntityRankedName(entState)
{
	var template = GetTemplateData(entState.template)
	var rank = entState.identity.rank;
	if (rank)
		return sprintf(translate("%(rank)s %(name)s"), { rank: rank, name: template.name.specific });
	else
		return template.name.specific;
}

function getRankIconSprite(entState)
{
	if ("Elite" == entState.identity.rank)
		return "stretched:session/icons/rank3.png";
	else if ("Advanced" == entState.identity.rank)
		return "stretched:session/icons/rank2.png";
	else if (entState.identity.classes && entState.identity.classes.length && -1 != entState.identity.classes.indexOf("CitizenSoldier"))
		return "stretched:session/icons/rank1.png";

	return "";
}

/**
 * Returns a message with the details of the trade gain.
 */
function getTradingTooltip(gain)
{
	var gainString = gain.traderGain;
	if (gain.market1Gain && gain.market1Owner == gain.traderOwner)
		gainString += translate("+") + gain.market1Gain;
	if (gain.market2Gain && gain.market2Owner == gain.traderOwner)
		gainString += translate("+") + gain.market2Gain;

	var tooltip = sprintf(translate("%(gain)s (%(player)s)"), {
		gain: gainString,
		player: translate("you")
	});

	if (gain.market1Gain && gain.market1Owner != gain.traderOwner)
		tooltip += translate(", ") + sprintf(translate("%(gain)s (%(player)s)"), {
			gain: gain.market1Gain,
			player: sprintf(translate("player %(name)s"), { name: gain.market1Owner })
		});
	if (gain.market2Gain && gain.market2Owner != gain.traderOwner)
		tooltip += translate(", ") + sprintf(translate("%(gain)s (%(player)s)"), {
			gain: gain.market2Gain,
			player: sprintf(translate("player %(name)s"), { name: gain.market2Owner })
		});

	return tooltip;
}

function getAttackTypeLabel(type)
{
	if (type === "Charge") return translate("Charge Attack:");
	if (type === "Melee") return translate("Melee Attack:");
	if (type === "Ranged") return translate("Ranged Attack:");

	warn(sprintf("Internationalization: Unexpected attack type found with code ‘%(attackType)s’. This attack type must be internationalized.", { attackType: type }));
	return translate("Attack:");
}

/**
 * Returns the entity itself except when garrisoned where it returns its garrisonHolder
 */
function getEntityOrHolder(ent)
{
	var entState = GetEntityState(ent);
	if (entState && !entState.position && entState.unitAI && entState.unitAI.orders.length > 0 &&
			entState.unitAI.orders[0].type == "Garrison")
		return entState.unitAI.orders[0].data.target;

	return ent;
}
