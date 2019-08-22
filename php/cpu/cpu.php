<?php
require_once '../functions.php';

class Cpu {

	public function getCores() {
    $cmd = 'sysctl -n hw.ncpu';
    $result = intval(Shell::exec($cmd));
    return empty($result) ? 1 : $result;
	}

}

?>