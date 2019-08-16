<?php
require_once '../functions.php';
// zfs get (is awesome...)
// sysctl kstat

class Disk {

	public function getInfo() {
    $result = array();
    foreach($this->getNames() as $key => $value) {
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
	
	public function getDatasetList() {
		$cmd = 'zfs list | tail -n +3';
		$results = Shell::exec($cmd);
		// needs work
		return explode("\n", $results);
	}

	public function getPoolList() {
		$cmd = 'zpool list | tail -n +2';
		return preg_split('/\h+/', Shell::exec($cmd))[0];
	}

}

?>