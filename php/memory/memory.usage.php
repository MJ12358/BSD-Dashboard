<?php
require_once 'memory.php';

class MemoryUsage extends Memory {

	public function __construct() {
		// parent::__construct();
		echo json_encode(array(
			'data' => $this->getCurrentUsage(),
			'total' => $this->getTotal()
		));
	}

  public function getCurrentUsage() {
    $cmd = 'top -btIquz | tail -n +4 | head -2 | cut -d : -f2';
    $result = Shell::exec($cmd);
    $result = preg_replace("/\n\s/", ', ', $result);
    $result = explode(', ', $result);
    $results = array();
    foreach($result as $k => $v) {
      $values = explode(' ', $v);
      if ($values[1] !== 'Total' && $values[1] !== 'Wired') {
        $results[$values[1]] = array(
          // 'title' => $values[1],
          'bytes' => Convert::to_bytes($values[0])
          // 'formatted' => $values[0]
        );
      }
    }
    return $results;
  }

}

$memory_usage = new MemoryUsage();

?>