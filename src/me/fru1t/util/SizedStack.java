package me.fru1t.util;

import java.lang.reflect.Array;
import java.util.Arrays;

public class SizedStack<E> {
	private E[] elements;
	private int nextAvailableElement;
	private boolean isFilled;
	private Class<E> clazz;
	
	@SuppressWarnings("unchecked")
	public SizedStack(Class<E> clazz, int size) {
		this.clazz = clazz;
		elements = (E[]) Array.newInstance(clazz, size);
		nextAvailableElement = 0;
		isFilled = false;
	}
	
	public void add(E element) {
		elements[nextAvailableElement++] = element;
		if (nextAvailableElement >= elements.length) {
			nextAvailableElement %= elements.length;
			isFilled = true;
		}
	}
	
	@SuppressWarnings("unchecked")
	public E[] getElements() {
		if (nextAvailableElement == 0 && !isFilled) {
			return (E[]) Array.newInstance(clazz, 0);
		}
		return (E[]) ((isFilled) ?  elements : Arrays.copyOfRange(elements, 0, nextAvailableElement));
	}
	
	public int size() {
		return (isFilled) ? elements.length : nextAvailableElement;
	}
}
