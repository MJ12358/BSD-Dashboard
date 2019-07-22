<?php
require_once '../functions.php';
// zfs get (is awesome...)

class Disk {

	// public $disk_count;
	public $disk_names;

	// still not sure if i want to construct these or just call them when needed...
	public function __construct() {
		// $this->disk_count = $this->getCount();
		$this->disk_names = $this->getNames();
	}

	public function getInfo() {
    $result = array();
    foreach($this->$disk_names as $key => $value) {
      // $cmd = 'diskinfo -v /dev/' . $value . ' | tail -n +2';
      $cmd = 'smartctl -i /dev/' . $value . ' | egrep \'Family|Capacity|Rotation\' | cut -d : -f2';
      $results = explode("\n" , Shell::exec($cmd));
      preg_match("/\[(.*?)\]/", $results[1], $size);
      $result[$value] = trim($results[0]) . ' ' . $size[1] . ' ' . trim($results[2]);
    }
    return $result;
  }

	public function getNames() {
    $cmd = 'sysctl -n kern.disks';
    return explode(' ', Shell::exec($cmd));
	}
	
	public function getInterfaceName() {
    $cmd = 'sysctl -n dev.ahci.0.%desc';
    return Shell::exec($cmd);
	}
	
	public function getDatasetList() {
		$cmd = 'zfs list | tail -n +3';
		$results = Shell::exec($cmd);
		// needs work
		return explode("\n", $results);
	}

}

?>