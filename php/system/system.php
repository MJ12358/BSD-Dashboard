<?php
include_once '../functions.php';

class System {

	public function __construct() {
		echo json_encode(array(
			'hostname' => gethostname(),
			'motherboard' => getMotherboard(),
			'os' => getOperatingSystem(),
			'platform_os' => getPlatformOs(),

		));
	}

// requires root
  public function getBiosVersion() {
    $cmd = 'dmidecode -qt bios | egrep \'Vendor|Version\' | cut -d : -f2';
    $result = preg_replace("/\s+/", ' ', Shell::exec($cmd));
    return $result;
  }

  public function getKernelVersion() {
		// why not just use uname -r
    $kernel = explode(' ', file_get_contents('/proc/version'));
    return $kernel[2];
  }

	// requires root
  public function getMotherboard() {
    $cmd = 'dmidecode -qt baseboard | egrep \'Manufacturer|Product\' | cut -d : -f2';
    return preg_replace("/\s+/", ' ', Shell::exec($cmd));
  }

  public function getOperatingSystem() {
		// y not use sysctl -n kern.ident
    $cmd = 'uname -i';
    return Shell::exec($cmd);
  }

  public function getPlatformOs() {
		// y not use sysctl -n kern.ostype && osrelease
    $uname = explode(' ', php_uname());
    return $uname[0] . ' ' . $uname[2];
  }

	// yeah this is super inaccurate...
  public function getUptime() {
    $cmd = 'sysctl -n kern.boottime';
    $uptime = Shell::exec($cmd);
    $uptime = explode(' ', $uptime)[6];
    return Convert::from_seconds($uptime);
  }

}

?>