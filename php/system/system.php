<?php
include_once '../functions.php';

class System {

	public function __construct() {

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