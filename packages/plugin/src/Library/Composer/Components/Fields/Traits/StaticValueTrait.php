<?php
/**
 * Freeform for Craft.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2020, Solspace, Inc.
 *
 * @see          https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Library\Composer\Components\Fields\Traits;

trait StaticValueTrait
{
    /** @var mixed */
    protected $staticValue;

    /**
     * @return mixed
     */
    public function getStaticValue()
    {
        return $this->staticValue;
    }
}