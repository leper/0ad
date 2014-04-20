/**
 * This array holds the data to populate the general section with.
 * Data is in the form [Title, Tooltip, {ActionType:Action}, InputType].
 */
var options = {
	"generalSetting":
	[
		[translate("Windowed Mode"), translate("Start 0 A.D. in windowed mode"), {"config":"windowed"}, "boolean"],
		[translate("Background Pause"), translate("Pause single player games when window loses focus"), {"config":"pauseonfocusloss"}, "boolean"],
	],
	"graphicsSetting":
	[
		[translate("Prefer GLSL"), translate("Use OpenGL 2.0 shaders (recommended)"), {"renderer":"PreferGLSL"}, "boolean"],
		[translate("Shadows"), translate("Enable shadows"), {"renderer":"Shadows"}, "boolean"],
		[translate("Particles"), translate("Enable particles"), {"renderer":"Particles"}, "boolean"],
		[translate("Show Sky"), translate("Render Sky"), {"renderer":"ShowSky"}, "boolean"],
		[translate("Unit Silhouettes"), translate("Show outlines of units behind buildings"), {"renderer":"Silhouettes"}, "boolean"],
		[translate("Shadow Filtering"), translate("Smooth shadows"), {"renderer":"ShadowPCF"}, "boolean"],
		[translate("HQ Waviness"), translate("Use real normals for ocean-wave rendering, instead of applying them as a flat texture"), {"renderer":"WaterNormal"}, "boolean"],
		[translate("Real Water Depth"), translate("Use actual water depth in rendering calculations"), {"renderer":"WaterRealDepth"}, "boolean"],
		[translate("Water Reflections"), translate("Allow water to reflect a mirror image"), {"renderer":"WaterReflection"}, "boolean"],
		[translate("Water Refraction"), translate("Use a real water refraction map and not transparency"), {"renderer":"WaterRefraction"}, "boolean"],
		[translate("Shore Foam"), translate("Show foam on water near shore depending on water waviness"), {"renderer":"WaterFoam"}, "boolean"],
		[translate("Shore Waves"), translate("Show breaking waves on water near shore (Requires HQ Waviness)"), {"renderer":"WaterCoastalWaves"}, "boolean"],
		[translate("Water Shadows"), translate("Cast shadows on water"), {"renderer":"WaterShadow"}, "boolean"],
	],
	"soundSetting":
	[
		[translate("Master Gain"), translate("Master audio gain"), {"config":"sound.mastergain", "function":"Engine.SetMasterGain(Number(this.caption));"}, "number"],
		[translate("Music Gain"), translate("In game music gain"), {"config":"sound.musicgain", "function":"Engine.SetMusicGain(Number(this.caption));"}, "number"],
		[translate("Ambient Gain"), translate("In game ambient sound gain"), {"config":"sound.ambientgain", "function":"Engine.SetMusicGain(Number(this.caption));"}, "number"],
		[translate("Action Gain"), translate("In game unit action sound gain"), {"config":"sound.actiongain", "function":"Engine.SetMusicGain(Number(this.caption));"}, "number"],
		[translate("UI Gain"), translate("UI sound gain"), {"config":"sound.uigain", "function":"Engine.SetMusicGain(Number(this.caption));"}, "number"],
	],
	"lobbySetting":
	[
		[translate("Chat Backlog"), translate("Number of backlogged messages to load when joining the lobby"), {"config":"lobby.history"}, "number"],
		[translate("Chat Timestamp"), translate("Show time that messages are posted in the lobby chat"), {"config":"lobby.chattimestamp"}, "boolean"],
	],
};

function init()
{
	// WARNING: We assume a strict formatting of the XML and do minimal checking.
	for each (var prefix in Object.keys(options))
	{
		var lastSize;
		for (var i = 0; i < options[prefix].length; i++)
		{
			var body = Engine.GetGUIObjectByName(prefix + "[" + i + "]");
			var label = Engine.GetGUIObjectByName(prefix + "Label[" + i + "]");
			// Setup control.
			setupControl(options[prefix][i], i, prefix);
			// Setup label.
			label.caption = options[prefix][i][0];
			label.tooltip = options[prefix][i][1];
			// Move each element to the correct place.
			if (i > 0)
			{
				var newSize = new GUISize();
				newSize.left = lastSize.left;
				newSize.rright = lastSize.rright;
				newSize.top = lastSize.bottom;
				newSize.bottom = newSize.top + 25;
				body.size = newSize;
				lastSize = newSize;
			}
			else
			{
				lastSize = body.size;
			}
			// Show element.
			body.hidden = false;
		}
	}
}

/**
 * Setup the apropriate control for a given option.
 *
 * @param option Structure containing the data to setup an option.
 * @param prefix Prefix to use when accessing control, for example "generalSetting" when the tickbox name is generalSettingTickbox[i].
 */
function setupControl(option, i, prefix)
{
	switch (option[3])
	{
		case "boolean":
			var control = Engine.GetGUIObjectByName(prefix + "Tickbox[" + i + "]");
			var checked;
			var onPress = function(){};
			// Different option action load and save differently, so this switch is needed.
			for each (var action in Object.keys(option[2]))
			{
				switch (action)
				{
					case "config":
						// Load initial value if not yet loaded.
						if (!checked || typeof checked != boolean)
							checked = Engine.ConfigDB_GetValue("user", option[2][action]) === "true" ? true : false;
						// Hacky macro to create the callback.
						var callback = function(key)
						{
							return function()
							{
								Engine.ConfigDB_CreateValue("user", key, String(this.checked));
							};
						}(option[2][action]);
						// Merge the new callback with any existing callbacks.
						onPress = mergeFunctions(callback, onPress);
						break;
					case "renderer":
						// Load initial value if not yet loaded.
						if (!checked || typeof checked != boolean)
							checked = eval("Engine.Renderer_Get" + option[2][action] + "Enabled()");
						// Hacky macro to create the callback.
						var callback = function(key)
						{
							return function()
							{
								eval("Engine.Renderer_Set" + key + "Enabled(" + this.checked + ")");
							};
						}(option[2][action]);
						// Merge the new callback with any existing callbacks.
						onPress = mergeFunctions(callback, onPress);
						break;
					case "function":
						// This allows for doing low-level actions, like hiding/showing UI elements.
						onPress = mergeFunctions(eval("function(){" + option[2][action] + "}"), onPress);
						break;
					default:
						warn("Unknown option source type '" + action + "'");
				}
			}
			// Load final data to the control element.
			control.checked = checked;
			control.onPress = onPress;
			break;
		case "number":
			// TODO: Slider
		case "string":
			var control = Engine.GetGUIObjectByName(prefix + "Input[" + i + "]");
			var caption;
			var onPress = function(){};
			for each (var action in Object.keys(option[2]))
			{
				switch (action)
				{
					case "config":
						// Load initial value if not yet loaded.
						if (!checked || typeof checked != boolean)
							caption = Engine.ConfigDB_GetValue("user", option[2][action]);;
						// Hacky macro to create the callback.
						var callback = function(key)
						{
							return function()
							{
								Engine.ConfigDB_CreateValue("user", key, String(this.caption));
							};
						}(option[2][action]);
						// Merge the new callback with any existing callbacks.
						onPress = mergeFunctions(callback, onPress);
						break;
					case "function":
						// This allows for doing low-level actions, like hiding/showing UI elements.
						onPress = mergeFunctions(function(){eval(option[2][action])}, onPress);
						break;
					default:
						warn("Unknown option source type '" + action + "'");
				}
			}
			control.caption = caption;
			control.onPress = onPress;
			break;
		default:
			warn("Unknown option type '" + options[3] + "', assuming string. Valid types are 'number', 'string', or 'bool'.");
			var control = Engine.GetGUIObjectByName(prefix + "Input[" + i + "]");
			break;
	}
	control.hidden = false;
	control.tooltip = option[1];
	return control;
}

/**
 * Merge two functions which don't expect arguments.
 *
 * @return Merged function.
 */
function mergeFunctions(function1, function2)
{
	return function()
	{
		function1.apply(this);
		function2.apply(this);
	};
}
