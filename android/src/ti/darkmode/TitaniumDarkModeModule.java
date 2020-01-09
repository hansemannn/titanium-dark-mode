/**
 * This file was auto-generated by the Titanium Module SDK helper for Android
 * Appcelerator Titanium Mobile
 * Copyright (c) 2009-2018 by Appcelerator, Inc. All Rights Reserved.
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 *
 */
package ti.darkmode;

import org.appcelerator.kroll.KrollModule;
import org.appcelerator.kroll.annotations.Kroll;
import org.appcelerator.kroll.common.Log;
import org.appcelerator.kroll.common.TiConfig;
import org.appcelerator.titanium.TiApplication;

import android.content.res.Configuration;

@Kroll.module(name="TitaniumDarkMode", id="ti.darkmode")
public class TitaniumDarkModeModule extends KrollModule
{

	private static final String LCAT = "TitaniumDarkModeModule";
	private static final boolean DBG = TiConfig.LOGD;

	@Kroll.method
	public boolean isDarkModeEnabled()
	{
		int nightModeFlags = TiApplication.getInstance().getCurrentActivity().getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;

		return nightModeFlags == Configuration.UI_MODE_NIGHT_YES;
	}
}
