<?php
require_once '../functions.php';

class Cpu {

	public $core_count;

	public function __construct() {
		$this->$core_count = $this->getCores();
	}

	public function getCores() {
    $cmd = 'sysctl -n hw.ncpu';
    $tmp = intval(Shell::exec($cmd));
    return empty($tmp) ? 1 : $tmp;
	}
	// move this to the system class
	public function getModel() {
    $cmd = 'sysctl -n hw.model';
    return Shell::exec($cmd);
  }

}

?>