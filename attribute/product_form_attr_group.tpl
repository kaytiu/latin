<?php if(isset($group_info['list'])){?>
<input type="hidden" name="attr_group_id" value="<?php echo $group_info['id'];?>" />
<?php foreach ($group_info['list'] as $group_area){?>
<div class="panel-default" style="padding: 15px;">
	<div style="margin-bottom: 15px;"><input type="text" readonly="readonly" value="<?php echo $group_area['area_name'];?>" class="form-control" style="width:300px;"></div>
    <?php if(isset($group_area['attribute_list'])){?>
    <?php foreach ($group_area['attribute_list'] as $area_attr){?>
    	<input type="hidden" name="attributes[<?php echo $area_attr['id']?>][attr_id]" value="<?php echo $area_attr['id'];?>" />
    	<input type="hidden" name="attributes[<?php echo $area_attr['id']?>][attr_type]" value="<?php echo $area_attr['attr_type'];?>" />
    	<div class="form-group" style="overflow: hidden;">
        	<div class="col-md-2 control-label"><label><?php echo $area_attr['attr_name_cn'];?></label></div>
            <div class="col-md-10">
            	<?php if($area_attr['attr_type'] == 0){?> <!-- 自定义 -->
            	<input type="text" class="form-control" name="attributes[<?php echo $area_attr['id']?>][attr_value]" />
            	<?php }else if($area_attr['attr_type'] == 1){?> <!-- 单选 -->
            	<select class="form-control" name="attributes[<?php echo $area_attr['id']?>][attr_option_ids][]">
		        	<option value="-1">---请选择---</option>
		            <?php foreach ($area_attr['group_options'] as $option){?>
		            <option value="<?php echo $option['id'];?>"><?php echo $option['option_value_cn'];?></option>
		            <?php }?>
				</select>
            	<?php }else if($area_attr['attr_type'] == 2){?> <!-- 多选 -->
            	<div class="form-control" style="overflow: auto;min-height: 80px;">
            		<?php foreach ($area_attr['group_options'] as $option){?>
            		<div style="overflow: hidden;">
            			<div class="col-md-1" style="padding: 0px;width: 20px;"><input type="checkbox" class="form-control" value="<?php echo $option['id'];?>" name="attributes[<?php echo $area_attr['id']?>][attr_option_ids][]" /></div>
            			<label class="col-md-10" style="padding: 0px;"><?php echo $option['option_value_cn'];?></label>
					</div>
            		<?php }?>
				</div>
            	<?php }?>
			</div>
		</div>
	<?php }?>
    <?php }?>	
</div>
<?php }?>
<?php }?>