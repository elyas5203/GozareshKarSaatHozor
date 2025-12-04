<?php
/*	Jalaali PHP Functions
	Copyright (C) 2000-2018 Sallar Kaboli
	<sallar.kaboli@gmail.com>
	This software is protected by GNU GPL license.
	For more information regarding the license, please check
	http://www.gnu.org/copyleft/gpl.html
*/

function jalaali_to_gregorian($jy, $jm, $jd, $mod = '')
{
	if ($jy > 979) {
		$gy = 1600;
		$jy -= 979;
	} else {
		$gy = 621;
	}
	$days = (365 * $jy) + (((int) ($jy / 33)) * 8) + ((int) ((($jy % 33) + 3) / 4)) + 78 + $jd + (($jm < 7) ? ($jm - 1) * 31 : (($jm - 7) * 30) + 186);
	$gy += 400 * ((int) ($days / 146097));
	$days %= 146097;
	if ($days > 36524) {
		$gy += 100 * ((int) (--$days / 36524));
		$days %= 36524;
		if ($days >= 365) $days++;
	}
	$gy += 4 * ((int) ($days / 1461));
	$days %= 1461;
	if ($days > 365) {
		$gy += (int) (($days - 1) / 365);
		$days = ($days - 1) % 365;
	}
	$gd = $days + 1;
	foreach (array(0, 31, (($gy % 4 == 0 and $gy % 100 != 0) or ($gy % 400 == 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31) as $gm => $v) {
		if ($gd <= $v) break;
		$gd -= $v;
	}
	return ($mod == '') ? array($gy, $gm, $gd) : $gy . $mod . $gm . $mod . $gd;
}

function gregorian_to_jalaali($gy, $gm, $gd, $mod = '')
{
	$g_d_m = array(0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334);
	if ($gy > 1582 or ($gy == 1582 and $gm > 10) or ($gy == 1582 and $gm == 10 and $gd > 14)) {
		$jy = (int) ((((10000 * $gy) + (336 * $gm) + (27164 * $gd) - 4922112) / 10000));
		$d = 0;
	} else {
		$jy = 0;
		$d = (int) ((((10000 * $gy) + (336 * $gm) + (27164 * $gd) - 4922112) / 10000));
	}
	$jd = (365 * $jy) + ((int) ($jy / 33) * 8) + ((int) ((($jy % 33) + 3) / 4)) + $d;
	$jm = (int) (sqrt(8 * $jd + 33) / 4);
	$jd -= (int) (((($jm * $jm) - 1) * ($jm - 1)) / 8);
	$jd -= (int) (($jm - 1) / 2 * (1 - ($jm % 2)));
	if ($jd > 186) {
		$jm -= 6;
		$jd -= 186;
	}
	return ($mod == '') ? array($jy, $jm, $jd) : $jy . $mod . $jm . $mod . $jd;
}
?>