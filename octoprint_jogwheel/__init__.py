# coding=utf-8
from __future__ import absolute_import
import octoprint.plugin


class JogwheelPlugin(octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.TemplatePlugin
):

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {}

    ##~~ AssetPlugin mixin

    def get_assets(self):
        return {
            "js": ["js/spectrum.js", "js/jogwheel.js"],
            "css": ["css/jogwheel.css"]
        }

    ##~~ TemplatePlugin mixin
    def get_template_vars(self):
        return {"plugin_version": self._plugin_version}

    ##~~ Softwareupdate hook

    def get_update_information(self):
        return {
            "jogwheel": {
                "displayName": "Jog Wheel Control",
                "displayVersion": self._plugin_version,

                # version check: github repository
                "type": "github_release",
                "user": "jneilliii",
                "repo": "OctoPrint-JogWheelControl",
                "current": self._plugin_version,

                # update method: pip
                "pip": "https://github.com/jneilliii/OctoPrint-JogWheelControl/archive/{target_version}.zip",
            }
        }


__plugin_name__ = "Jog Wheel Control"
__plugin_pythoncompat__ = ">=3,<4"  # Only Python 3

def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = JogwheelPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
