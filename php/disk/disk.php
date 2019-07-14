<?php
require_once '../functions.php';

class Disk {

	public $disk_names;

	public function __construct() {
		$this->disk_names = $this->getNames();
	}

	public function getNames() {
    $cmd = 'sysctl -n kern.disks';
    return explode(' ', Shell::exec($cmd));
  }

}

?>